import * as XLSX from 'xlsx-js-style';

/**
 * Enhanced export utility for Om Dedy Dashboard
 * Fully refactored to be dynamic based on L1 Phases
 * Restores corporate branding, metadata rows, and wrap-text layout
 */
export const exportToExcel = async (
  project: any,
  projectTreeRoots: any[],
  setIsExcelLoading: (loading: boolean) => void
) => {
  if (!project || !project.tasks) return;

  // 1. DYNAMICALLY EXTRACT UNIQUE PHASES FROM CURRENT TASK INPUTS
  const phases = [...new Set(project.tasks.map((t: any) => t.phase).filter((p: any) => p && typeof p === 'string' && p.trim() !== ""))] as string[];

  // 2. PRE-CALCULATE DYNAMIC TOTALS FOR RINGKASAN AT THE TOP
  const phaseTotalsMap: Record<string, any> = {};
  phases.forEach((phase: string) => {
    const phaseTasks = project.tasks.filter((t: any) => t.phase === phase);
    let totalMinutes = phaseTasks.reduce((sum: number, t: any) => sum + (parseInt(t.manHoursMinutes) || 0), 0);
    let hoursFromMinutes = Math.floor(totalMinutes / 60);
    let remainingMinutes = totalMinutes % 60;
    let days = Math.floor(hoursFromMinutes / 8);
    let remainingHours = hoursFromMinutes % 8;

    phaseTotalsMap[phase] = {
      str: `${days} Days, ${remainingHours} Hours, ${remainingMinutes} Mins`,
      minsStr: `${totalMinutes} Mins`,
      totalMinutes: totalMinutes
    };
  });

  // 3. INITIALIZE TABLE MATRIX WITH STATIC AND DYNAMIC META INFO
  const data: any[][] = [
    ["OM DEDY - OPERATIONAL MONITORING DASHBOARD REPORT", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Project Name", project.project_name || project.name || "-", "", "Global Status", project.status || "TODO", "", "", "", "", "", "", "", ""],
    ["Start Date", project.start_date || project.startDate || "-", "", "Total Man Hours", (project.total_man_hours || project.totalManHours) ? `${project.total_man_hours || project.totalManHours} Hours` : "0 Hours", "", "", "", "", "", "", "", ""],
    ["End Date", project.end_date || project.endDate || "-", "", "PIC", project.pic_name || project.pic || "-", "", "", "", "", "", "", "", ""],
    ["Project Type", project.project_type || project.projectType || "INTI", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""]
  ];

  // Append Dynamic Ringkasan Rows (Point 2 & Dynamic L1 request)
  phases.forEach(phase => {
    data.push([`Total Days ${phase}:`, phaseTotalsMap[phase].str, "", "", "", "", "", "", "", "", "", "", ""]);
  });

  data.push(["", "", "", "", "", "", "", "", "", "", "", "", ""]); // Extra separator spacer row

  // Track exact index location of Table Header Row
  const headerRowIndex = data.length;
  data.push([
    "Project Name", "Phase L1", "Task", "Type Task", "Components",
    "Detail Breakdown", "Man Hours", "Man Hours (In Minutes)",
    "Start Date", "End Date", "Status", "Fachrul Feedback", "Barra Feedback"
  ]);

  // Define base structural merges
  const merges: any[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title Header block
    { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // Project Name block
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Total Man Hours value cell alignment fix
    { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } }  // PIC block
  ];

  // 4. POPULATE DYNAMIC ROWS AND CALCULATE LOGICAL CELL SPANS
  phases.forEach((phase: string) => {
    const phaseTasks = project.tasks.filter((t: any) => t.phase === phase);
    if (phaseTasks.length === 0) return;

    const startRowIndex = data.length;

    phaseTasks.forEach((task: any) => {
      data.push([
        project.project_name || project.name || "-",
        phase,
        task.title || "-",
        task.task_type || task.type || "-",
        (Array.isArray(task.components) ? task.components.join(', ') : task.components) || "-",
        task.detail_task || task.detail || "-",
        (task.man_hours || task.manHours) ? `${task.man_hours || task.manHours} h` : "-",
        task.manHoursMinutes ? `${task.manHoursMinutes} m` : "-",
        task.start_time || task.startDate || "-",
        task.end_time || task.endDate || "-",
        task.status || "TODO",
        task.suggestion_fachrul || task.fachrulFeedback || "-",
        task.suggestion_barra || task.barraFeedback || "-"
      ]);
    });

    const endRowIndex = data.length - 1;

    // Trigger vertical merge spans for Project Name and Phase columns safely
    if (endRowIndex >= startRowIndex) {
      merges.push({ s: { r: startRowIndex, c: 0 }, e: { r: endRowIndex, c: 0 } });
      merges.push({ s: { r: startRowIndex, c: 1 }, e: { r: endRowIndex, c: 1 } });
    }

    // Append Phase Total Row with proper field indexing matching
    const totalRowIndex = data.length;
    data.push([
      project.project_name || project.name || "-",
      phase,
      `TOTAL ${phase} DAYS :`,
      "", "", "",
      phaseTotalsMap[phase].str,
      phaseTotalsMap[phase].minsStr,
      "", "", "", "", ""
    ]);

    // Merge horizontal layout specifically for total strings from Col C to Col F
    merges.push({ s: { r: totalRowIndex, c: 2 }, e: { r: totalRowIndex, c: 5 } });
  });

  // 5. TRANSLATE MATRIX TO COMPILATION WORKSHEET WITH AGGRESSIVE STYLE ENGINE
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!merges'] = merges;

  // Establish Wide Layout Sizing Matrices
  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 38 }, { wch: 16 }, { wch: 15 },
    { wch: 55 }, { wch: 25 }, { wch: 22 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 18 }, { wch: 18 }
  ];

  ws['!rows'] = ws['!rows'] || [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // Deep loop to inject colors, layout alignment and wrap-text rules
  for (let R = range.s.r; R <= range.e.r; ++R) {
    // Set row height logic
    if (R === 0) ws['!rows'][R] = { hpt: 35 };
    else if (R === headerRowIndex) ws['!rows'][R] = { hpt: 26 };
    else if (R > headerRowIndex) {
      const isTotalRow = String(data[R][2] || '').includes("TOTAL");
      ws['!rows'][R] = { hpt: isTotalRow ? 30 : 24 };
    } else {
      ws['!rows'][R] = { hpt: 20 };
    }

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      // A. Main Report Banner Color Block (Warna Biru Tua)
      if (R === 0) {
        ws[cellRef].s = {
          font: { bold: true, name: "Arial", sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1F4E78" } }, // Dark Corporate Blue
          alignment: { vertical: "center", horizontal: "left" }
        };
        continue;
      }

      // B. Main Table Headers Color Block (Warna Biru Header)
      if (R === headerRowIndex) {
        ws[cellRef].s = {
          font: { bold: true, name: "Arial", sz: 10, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2F5597" } }, // Bright Corporate Blue Header
          alignment: { vertical: "center", horizontal: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
        continue;
      }

      // C. Metadata Rows Styling (Rows below title but above headers)
      if (R < headerRowIndex) {
        const isLabelCell = (C === 0 || C === 3);
        ws[cellRef].s = {
          font: { bold: isLabelCell, name: "Arial", sz: 10 },
          alignment: { vertical: "center", horizontal: "left" }
        };
        continue;
      }

      // D. Core Table Data Rows Styling (Rows below table headers)
      const currentCellCValue = String(data[R][2] || '');
      if (currentCellCValue.includes("TOTAL")) {
        // Totals Styling
        ws[cellRef].s = {
          font: { bold: true, name: "Arial", sz: 10, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "F2F2F2" } },
          alignment: { vertical: "center", horizontal: C === 2 ? "left" : "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "double", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          }
        };
      } else {
        // Regular Task Styling with targetted Column WrapText (Point 3 & 4 Fix)
        const shouldWrap = (C === 2 || C === 5); // Column C (Task) & Column F (Detail Breakdown)
        ws[cellRef].s = {
          font: { name: "Arial", sz: 10 },
          alignment: { 
            vertical: "center", 
            horizontal: (C === 0 || C === 1 || C >= 6) ? "center" : "left",
            wrapText: shouldWrap // FORCES EXCEL TEXT WRAPPING
          },
          border: {
            top: { style: "thin", color: { rgb: "E0E0E0" } },
            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
            left: { style: "thin", color: { rgb: "E0E0E0" } },
            right: { style: "thin", color: { rgb: "E0E0E0" } }
          }
        };
      }
    }
  }

  // 6. BUILD FINAL WORKBOOK & POST TO SERVERLESS M365 GATEWAY
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
  
  const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  const filename = `OM_DEDY_Timeline_${project.project_name || project.name || 'Project'}_${Date.now()}.xlsx`;
  const backendUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

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
