import * as XLSX from 'xlsx-js-style';

/**
 * Enhanced export utility for Om Dedy Dashboard
 * Generates an EXACT layout using AOA and xlsx-js-style
 * Includes Safe Sorting Layer and Subtotal Mandays per Phase
 */
export const exportToExcel = (project: any, hierarchicalPhases: any[]) => {
  if (!project || !hierarchicalPhases) {
    console.error("Export failed: Missing project or phases data");
    return;
  }

  // 1. Safe Sort Helper to handle Drag-and-Drop Order
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

  // 2. Clean Date Formatter Utility
  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  // 3. Man Days Formatter (9 Hours = 1 Day Rule)
  const formatManDays = (totalHours: number) => {
    if (!totalHours) return '0 Days, 0 Hours, 0 Mins';
    const days = Math.floor(totalHours / 9); 
    const hours = Math.floor(totalHours % 9);
    const mins = Math.round((totalHours % 1) * 60);
    return `${days} Days, ${hours} Hours, ${mins} Mins`;
  };

  let fsdHours = 0, devHours = 0, sitHours = 0;
  // APPLY SORTING TO PHASES
  const sortedPhases = safeSortData(hierarchicalPhases);

  // First Pass: Calculate Global Hours from Sorted L2 Tasks Only
  sortedPhases.forEach((phase) => {
    const phaseName = (phase.title || phase.name || '').toUpperCase();
    const tasks = safeSortData(phase.children || phase.tasks || []);
    
    tasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      if (phaseName.includes('FSD')) fsdHours += hours;
      else if (phaseName.includes('DEV')) devHours += hours;
      else if (phaseName.includes('SIT')) sitHours += hours;
    });
  });

  const trueTotalHours = fsdHours + devHours + sitHours;

  // 4. Build Sheet Matrix (AOA) with Formatted Dates
  const aoa: any[][] = [
    [`OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT`], 
    [], 
    [`Project Name`, project.project_name || project.name || '-', ``, `Global Status`, project.status || 'TODO'], 
    [`Start Date`, formatDate(project.start_date), ``, `Total Man Hours`, `${trueTotalHours} Hours`], 
    [`End Date`, formatDate(project.end_date), ``, `PIC`, project.pic_name || project.pic || '-'], 
    [], 
    [`Total Man days FSD:`, formatManDays(fsdHours)], 
    [`Total Man days DEV:`, formatManDays(devHours)], 
    [`Total Man days SIT:`, formatManDays(sitHours)], 
    [], 
    [ 
      "Project Name", "Phase L1", "Task", "Type Task", "Components", 
      "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)", 
      "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback"
    ]
  ];

  const merges: any[] = [ { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } } ];
  let currentRow = 11; 

  // Second Pass: Populate rows from sorted lists
  sortedPhases.forEach((phase) => {
    const rawTasks = phase.children && phase.children.length > 0 ? phase.children : [{}];
    // APPLY SORTING TO TASKS INSIDE PHASE
    const sortedTasks = safeSortData(rawTasks);
    const startRow = currentRow; 
    let phaseTotalHours = 0;

    sortedTasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      const mins = hours * 60;
      phaseTotalHours += hours;

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

    // === INJECT SUBTOTAL ROW AT THE END OF L1 ===
    const safePhaseName = (phase.title || phase.name || 'PHASE').toUpperCase();
    aoa.push([
      project.project_name || project.name || '-', 
      phase.title || phase.name || '-', 
      `TOTAL ${safePhaseName} MANDAYS :`, // In Task Column (Index 2)
      "", "", "", // Empty Type, Components, Detail
      formatManDays(phaseTotalHours), // In Man Hours Column (Index 6)
      `${phaseTotalHours * 60} Mins`, // In Minutes Column (Index 7)
      "", "", "", "", ""
    ]);
    
    // Merge Subtotal Label across columns C, D, E, F (Index 2 to 5)
    merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 5 } });
    currentRow++;

    // Merge L1 and Project Name vertically across all tasks + the subtotal row
    if (currentRow - startRow > 1) {
      merges.push({ s: { r: startRow, c: 1 }, e: { r: currentRow - 1, c: 1 } }); 
      merges.push({ s: { r: startRow, c: 0 }, e: { r: currentRow - 1, c: 0 } }); 
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!merges'] = merges;

  // Set Column Widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 25 }, 
    { wch: 65 }, { wch: 18 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, 
    { wch: 15 }, { wch: 35 }, { wch: 35 }
  ];

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

      // Is this our new Subtotal Row? (Check if value starts with TOTAL and ends with MANDAYS :)
      const isSubtotal = typeof cellValue === 'string' && cellValue.startsWith('TOTAL ') && cellValue.includes('MANDAYS');

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

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
  XLSX.writeFile(wb, `OM_DEDY_Timeline_${project.project_name || project.name || 'Project'}.xlsx`);
};
