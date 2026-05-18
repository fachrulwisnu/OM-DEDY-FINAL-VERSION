import * as XLSX from 'xlsx-js-style'; 

/**
 * Enhanced export utility for Om Dedy Dashboard
 * Generates an EXACT layout using AOA and xlsx-js-style
 * UPDATED: Calculate True Totals strictly from L1 PHASE inputs to respect SPARE time overrides
 * UPDATED: Minute-based precision for Days calculation
 */
export const exportToExcel = async (
  project: any, 
  hierarchicalPhases: any[],
  setIsExcelLoading: (loading: boolean) => void
) => {
  if (!project || !hierarchicalPhases) {
    console.error("Export failed: Missing project or phases data");
    return;
  }

  const pType = (project.project_type || 'INTI').toUpperCase();

  const formatDays = (totalHours: number, type: string) => {
    if (!totalHours) return '0 Days, 0 Hours, 0 Mins';
    const hoursPerDay = (type || '').toUpperCase() === 'KECIL' ? 2 : 6;
    const totalMinutes = Math.round(totalHours * 60);
    const minutesPerDay = hoursPerDay * 60;
    
    const days = Math.floor(totalMinutes / minutesPerDay);
    const remainingMinutes = totalMinutes % minutesPerDay;
    const hours = Math.floor(remainingMinutes / 60);
    const mins = Math.round(remainingMinutes % 60);
    
    return `${days} Days, ${hours} Hours, ${mins} Mins`;
  };

  const formatDate = (dateStr: any) => { 
    if (!dateStr || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) { return dateStr; }
  };

  const safeSortData = (arr: any[]) => {
    if (!arr || !Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const getVal = (item: any) => {
        if (item.sequence !== undefined && item.sequence !== null) return item.sequence;
        if (item.sort_order !== undefined && item.sort_order !== null) return item.sort_order;
        if (item.index !== undefined && item.index !== null) return item.index;
        if (item.position !== undefined && item.position !== null) return item.position;
        if (item.order !== undefined && item.order !== null) return item.order;
        return 0; 
      };
      return (getVal(a) || 0) - (getVal(b) || 0);
    });
  };

  let fsdHours = 0, devHours = 0, sitHours = 0;
  const sortedPhases = safeSortData(hierarchicalPhases);

  // CRITICAL FIX: Calculate True Totals strictly from L1 PHASE inputs to respect SPARE time overrides
  sortedPhases.forEach((phase) => {
    const phaseName = (phase.title || phase.name || '').toUpperCase();
    const phaseHours = parseFloat(phase.man_hours) || 0; // Take hours from L1, NOT from summing L2
    
    if (phaseName.includes('FSD')) fsdHours += phaseHours;
    else if (phaseName.includes('DEV')) devHours += phaseHours;
    else if (phaseName.includes('SIT')) sitHours += phaseHours;
  });

  const trueTotalHours = fsdHours + devHours + sitHours;

  const aoa: any[][] = [
    [`OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT`], [], 
    [`Project Name`, project.project_name || project.name || '-', ``, `Global Status`, project.status || 'TODO'], 
    [`Start Date`, formatDate(project.start_date), ``, `Total Man Hours`, `${trueTotalHours} Hours`], 
    [`End Date`, formatDate(project.end_date), ``, `PIC`, project.pic_name || project.pic || '-'], 
    [`Project Type`, pType, ``, ``, ``], [], 
    [`Total Days FSD:`, formatDays(fsdHours, pType)], 
    [`Total Days DEV:`, formatDays(devHours, pType)], 
    [`Total Days SIT:`, formatDays(sitHours, pType)], 
    [], 
    [ "Project Name", "Phase L1", "Task", "Type Task", "Components", "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)", "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback" ]
  ];

  const merges: any[] = [ { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } } ];
  let currentRow = 11; 

  sortedPhases.forEach((phase) => {
    const rawTasks = (phase.children && phase.children.length > 0) ? phase.children : [{}];
    const sortedTasks = safeSortData(rawTasks); 
    const startRow = currentRow; 
    
    // Use phase hours for total
    const phaseTotalHours = parseFloat(phase.man_hours) || 0; 

    sortedTasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      const mins = hours * 60;

      aoa.push([
        project.project_name || project.name || '-',
        phase.title || phase.name || '-',
        task.title || task.name || '-',
        task.task_type || task.type || '-',
        (Array.isArray(task.components) ? task.components.join(', ') : task.components) || '-',
        task.detail_task || task.detail || '-',
        hours ? `${hours} h` : '-',
        mins ? `${mins} m` : '-',
        formatDate(task.start_time || task.start_date), 
        formatDate(task.end_time || task.end_date),   
        task.status || 'TODO',
        task.suggestion_fachrul || task.fachrul_feedback || '-',
        task.suggestion_barra || task.barra_feedback || '-'
      ]);
      currentRow++;
    });

    const safePhaseName = (phase.title || phase.name || 'PHASE').toUpperCase();
    
    // Total row construction
    const totalRowData = [
      project.project_name || project.name || '-', // Column A
      phase.title || phase.name || '-',            // Column B
      `TOTAL ${safePhaseName} DAYS :`,             // Column C (Start of Merge)
      "", "", "",                                  // D, E, F (Padding)
      formatDays(phaseTotalHours, pType),          // Column G
      `${Math.round(phaseTotalHours * 60)} Mins`,  // Column H
      "", "", "", "", ""                           // Remaining
    ];
    aoa.push(totalRowData);
    
    // RESTORED: Dynamic vertical merge for Project Name & Phase L1 across TASKS ONLY
    if (currentRow > startRow) {
      merges.push({ s: { r: startRow, c: 0 }, e: { r: currentRow - 1, c: 0 } });
      merges.push({ s: { r: startRow, c: 1 }, e: { r: currentRow - 1, c: 1 } });
    }

    // Horizontal merge for the total title (C to F)
    merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 5 } });
    
    currentRow++;
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // Borders and Formatting Styles
  const borderDef = {
    top: { style: "thin", color: { rgb: "D9D9D9" } },
    bottom: { style: "thin", color: { rgb: "D9D9D9" } },
    left: { style: "thin", color: { rgb: "D9D9D9" } },
    right: { style: "thin", color: { rgb: "D9D9D9" } }
  };

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      if (!ws[cellRef]) continue;
      const cellValue = ws[cellRef].v;

      const isSubtotal = typeof cellValue === 'string' && cellValue.startsWith('TOTAL ') && cellValue.includes(' DAYS :');

      if (R === 0) { // Main Title
        ws[cellRef].s = {
          fill: { fgColor: { rgb: "1F4E78" } },
          font: { name: "Arial", sz: 14, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else if ((R >= 2 && R <= 4) || (R >= 6 && R <= 8)) { // Metadata
        ws[cellRef].s = {
          font: { name: "Arial", sz: 10, bold: C === 0 || C === 3 || C === 6 },
          alignment: { vertical: "center" }
        };
      } else if (R === 10) { // Table Headers
        ws[cellRef].s = {
          fill: { fgColor: { rgb: "2F5597" } },
          font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: borderDef
        };
      } else if (R >= 11) { // Data Rows
        if (C === 1 || C === 0) { // L1 and Project Name
          ws[cellRef].s = {
            fill: C === 1 ? { fgColor: { rgb: "F2F2F5" } } : undefined,
            font: { name: "Arial", sz: 10, bold: C === 1 },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: borderDef
          };
        } else if (isSubtotal) { // The Subtotal Label Cell
          ws[cellRef].s = {
            fill: { fgColor: { rgb: "EAEAEA" } },
            font: { name: "Arial", sz: 10, bold: true },
            alignment: { horizontal: "right", vertical: "center" },
            border: borderDef
          };
        } else if (C >= 6 && typeof ws[XLSX.utils.encode_cell({c: 2, r: R})]?.v === 'string' && ws[XLSX.utils.encode_cell({c: 2, r: R})].v.startsWith('TOTAL ')) { 
          // The Subtotal Value Cells (Man Hours & Minutes)
          ws[cellRef].s = {
            fill: { fgColor: { rgb: "EAEAEA" } },
            font: { name: "Arial", sz: 10, bold: true },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: borderDef
          };
        } else { // Normal Data Rows
          ws[cellRef].s = {
            font: { name: "Arial", sz: 10 },
            alignment: { horizontal: (C >= 8 && C <= 10) ? "center" : "top", vertical: "top", wrapText: true },
            border: borderDef
          };
        }
      }
    }
  }

  // 1. SAFE COLUMN WIDTHS
  ws['!cols'] = [
    { wch: 25 }, // A: Project Name
    { wch: 12 }, // B: Phase
    { wch: 38 }, // C: Task
    { wch: 16 }, // D: Type
    { wch: 15 }, // E: Components
    { wch: 55 }, // F: Detail
    { wch: 24 }, // G: Man Hours (Wide enough for "X Days, Y Hours...")
    { wch: 22 }, // H: Man Hours Minutes
    { wch: 15 }, // I: Start Date
    { wch: 15 }  // J: End Date
  ];

  // 2. SAFE ROW HEIGHTS FOR TOTALS
  ws['!rows'] = ws['!rows'] || [];
  const rangeHeights = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = rangeHeights.s.r; R <= rangeHeights.e.r; ++R) {
    const cellC = ws[XLSX.utils.encode_cell({ r: R, c: 2 })];
    const cellB = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
    
    // If it's a TOTAL row, give it extra height so it doesn't get cut off in M365
    if ((cellC && cellC.v && String(cellC.v).includes("TOTAL")) || 
        (cellB && cellB.v && String(cellB.v).includes("TOTAL"))) {
      ws['!rows'][R] = { hpt: 30 }; // Extra height for totals
    } else {
      ws['!rows'][R] = { hpt: 20 }; // Standard height
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
  
  const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const filename = `OM_DEDY_Timeline_${project.name || 'Project'}_${Date.now()}.xlsx`;
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  try {
    setIsExcelLoading(true);
    const response = await fetch(`${backendUrl}/api/m365/upload-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, excelBase64 })
    });

    const result = await response.json();
    if (result.success && result.embedUrl) {
      window.open(result.embedUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("Gagal memuat Excel dari Microsoft 365.");
    }
  } catch (error) {
    console.error("Integration Error:", error);
    alert("Terjadi kesalahan jaringan ke Backend M365.");
  } finally {
    setIsExcelLoading(false);
  }
};
