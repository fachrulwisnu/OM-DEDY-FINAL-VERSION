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
  if (!project || !hierarchicalPhases) return;

  const formatDate = (dateStr: any) => { 
    if (!dateStr || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) { return dateStr; }
  };

  // 1. Initialize Matrix with Table Headers
  const data: any[][] = [
    ["OM DEDY - PROJECT TIMELINE & BREAKDOWN REPORT", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Project Name", project.project_name || project.name || "-", "", "Global Status", project.status || "TODO", "", "", "", "", "", "", "", ""],
    ["Start Date", formatDate(project.start_date) || "-", "", "Total Man Hours", `${project.total_man_hours || project.man_hours || 0} Hours`, "", "", "", "", "", "", "", ""],
    ["End Date", formatDate(project.end_date) || "-", "", "PIC", project.pic_name || project.pic || "-", "", "", "", "", "", "", "", ""],
    ["Project Type", project.project_type || "INTI", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    [`Total Days FSD:`, project.total_days_fsd || "0 Days", "", "", "", "", "", "", "", "", "", "", ""],
    [`Total Days DEV:`, project.total_days_dev || "0 Days", "", "", "", "", "", "", "", "", "", "", ""],
    [`Total Days SIT:`, project.total_days_sit || "0 Days", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Project Name", "Phase L1", "Task", "Type Task", "Components", 
      "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)", 
      "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback"
    ]
  ];

  const merges: any[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } },
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },
    { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } }
  ];

  // Group tasks by Phase to calculate perfect spans using hierarchicalPhases
  const targetPhases = ["FSD", "DEV", "SIT"];
  
  targetPhases.forEach((phaseName) => {
    const phaseNode = hierarchicalPhases.find(p => (p.title || p.name || '').toUpperCase().includes(phaseName));
    if (!phaseNode) return;

    const phaseTasks = phaseNode.children || [];
    if (phaseTasks.length === 0) return;

    const startRowIndex = data.length; // Start of this phase block

    // Populate task rows for this phase
    phaseTasks.forEach((task: any) => {
      const hours = parseFloat(task.man_hours || task.hours) || 0;
      const mins = hours * 60;

      data.push([
        project.project_name || project.name || "-",
        phaseName,
        task.title || task.name || "-",
        task.task_type || task.type || "-",
        (Array.isArray(task.components) ? task.components.join(', ') : task.components) || "-",
        task.detail_task || task.detail || "-",
        hours ? `${hours} h` : "-",
        mins ? `${mins} m` : "-",
        formatDate(task.start_time || task.start_date) || "-",
        formatDate(task.end_time || task.end_date) || "-",
        task.status || "TODO",
        task.suggestion_fachrul || task.fachrul_feedback || "-",
        task.suggestion_barra || task.barra_feedback || "-"
      ]);
    });

    const endRowIndex = data.length - 1; // End of task rows for this phase

    // Apply Vertical Merges for Project Name (Col A) and Phase L1 (Col B) strictly across task rows
    if (endRowIndex >= startRowIndex) {
      merges.push({ s: { r: startRowIndex, c: 0 }, e: { r: endRowIndex, c: 0 } }); // Vertically merge Project Name
      merges.push({ s: { r: startRowIndex, c: 1 }, e: { r: endRowIndex, c: 1 } }); // Vertically merge Phase Name
    }

    // Calculate Phase Totals (Mirroring requested logic)
    // We use the sum of children minutes
    let totalMinutes = phaseTasks.reduce((sum: number, t: any) => {
        const h = parseFloat(t.man_hours || t.hours) || 0;
        return sum + (h * 60);
    }, 0);
    
    let hoursFromMinutes = Math.floor(totalMinutes / 60);
    let remainingMinutes = Math.round(totalMinutes % 60);
    let days = Math.floor(hoursFromMinutes / 8);
    let remainingHours = hoursFromMinutes % 8;
    let formattedDaysStr = `${days} Days, ${remainingHours} Hours, ${remainingMinutes} Mins`;

    // Append the Total Row with proper padding to keep Col A and Col B safe
    const totalRowIndex = data.length;
    data.push([
      project.project_name || project.name || "-",
      phaseName,
      `TOTAL ${phaseName} DAYS :`,
      "", "", "", // Padding for Columns D, E, F
      formattedDaysStr,
      `${totalMinutes} Mins`,
      "", "", "", "", ""
    ]);

    // Horizontally merge the Total Label across Columns C to F (indices 2 to 5)
    merges.push({ s: { r: totalRowIndex, c: 2 }, e: { r: totalRowIndex, c: 5 } });
  });

  // 2. Compile Sheet and Inject Layout Styles
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!merges'] = merges;

  // Explicit Column Widths to match original clean layout
  ws['!cols'] = [
    { wch: 25 }, // A: Project Name
    { wch: 12 }, // B: Phase L1
    { wch: 38 }, // C: Task
    { wch: 16 }, // D: Type Task
    { wch: 15 }, // E: Components
    { wch: 55 }, // F: Detail Breakdown
    { wch: 25 }, // G: Man Hours
    { wch: 22 }, // H: Man Hours (In Minutes)
    { wch: 15 }, // I: Start Date
    { wch: 15 }, // J: End Date
    { wch: 12 }, // K: Status
    { wch: 18 }, // L: Fachrul Feedback
    { wch: 18 }  // M: Barra Feedback
  ];

  // Inject Row Heights & Design Styles dynamically
  ws['!rows'] = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    ws['!rows'][R] = { hpt: R >= 12 ? 22 : 20 }; // Standard row sizing

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      // Apply basic standard alignment and font to all generated cells
      ws[cellRef].s = {
        font: { name: "Arial", sz: 10 },
        alignment: { vertical: "center", horizontal: (C === 0 || C === 1 || C >= 6) ? "center" : "left" }
      };

      // Style total rows specifically
      const cellValue = String(data[R][2] || '');
      if (cellValue.includes("TOTAL")) {
        ws['!rows'][R] = { hpt: 30 }; // Give totals breathing room
        ws[cellRef].s = {
          font: { bold: true, name: "Arial", sz: 10 },
          fill: { fgColor: { rgb: "F5F5F5" } },
          alignment: { vertical: "center", horizontal: C === 2 ? "left" : "center" },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "double", color: { rgb: "000000" } }
          }
        };
      }
    }
  }

  // 3. Convert Workbook to Base64 and pass to Microsoft 365 gateway backend
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
  
  const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const filename = `OM_DEDY_Timeline_${project.name || 'Project'}_${Date.now()}.xlsx`;
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
