
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
  if (!project) return;

  setIsExcelLoading(true);
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  try {
    const projectName = project.project_name || project.name || 'Project';

    // 2. EXTRACT TASKS FROM HIERARCHICAL PHASES OR PROJECT
    let tasksToUse: any[] = [];
    let phases: string[] = [];

    if (hierarchicalPhases && hierarchicalPhases.length > 0) {
      phases = hierarchicalPhases.map(p => (p.title || p.name || ''));
      hierarchicalPhases.forEach(p => {
        if (p.children) tasksToUse.push(...p.children);
      });
    } else if (project.tasks) {
      tasksToUse = project.tasks;
      phases = [...new Set(tasksToUse.map(t => t.phase).filter(p => p && p.trim() !== ""))];
    }

    const formatDate = (dateStr: any) => { 
      if (!dateStr || dateStr === '-') return '-';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; 
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      } catch (e) { return dateStr; }
    };

    function taskManHours(t: any) {
      return t.man_hours || t.hours || t.manHours || "0";
    }

    // 3. PRE-CALCULATE DYNAMIC TOTALS FOR RINGKASAN AT THE TOP
    const phaseTotalsMap: Record<string, any> = {};
    phases.forEach(phase => {
      const phaseTasks = tasksToUse.filter(t => (t.phase === phase || (hierarchicalPhases.find(hp => (hp.title || hp.name) === phase)?.children?.includes(t))));
      let totalMinutes = phaseTasks.reduce((sum, t) => sum + (parseFloat(taskManHours(t)) * 60 || 0), 0);
      
      // Fallback search if phase empty
      if (totalMinutes === 0 && hierarchicalPhases) {
        const pNode = hierarchicalPhases.find(p => (p.title || p.name) === phase);
        if (pNode && pNode.children) {
          totalMinutes = pNode.children.reduce((sum: number, t: any) => sum + (parseFloat(taskManHours(t)) * 60 || 0), 0);
        }
      }

      let hoursFromMinutes = Math.floor(totalMinutes / 60);
      let remainingMinutes = Math.round(totalMinutes % 60);
      let days = Math.floor(hoursFromMinutes / 8);
      let remainingHours = hoursFromMinutes % 8;
      
      phaseTotalsMap[phase] = {
        str: `${days} Days, ${remainingHours} Hours, ${remainingMinutes} Mins`,
        minsStr: `${totalMinutes} Mins`,
        totalMinutes: totalMinutes
      };
    });

    // 4. INITIALIZE TABLE MATRIX WITH STATIC AND DYNAMIC META INFO
    const data: any[][] = [
      ["OM DEDY - OPERATIONAL MONITORING DASHBOARD REPORT", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["Project Name", projectName, "", "Global Status", project.status || "TODO", "", "", "", "", "", "", "", ""],
      ["Start Date", formatDate(project.start_date || project.startDate) || "-", "", "Total Man Hours", project.total_man_hours || project.man_hours || project.totalManHours ? `${project.total_man_hours || project.man_hours || project.totalManHours} Hours` : "0 Hours", "", "", "", "", "", "", "", ""],
      ["End Date", formatDate(project.end_date || project.endDate) || "-", "", "PIC", project.pic_name || project.pic || "-", "", "", "", "", "", "", "", ""],
      ["Project Type", project.project_type || project.projectType || "INTI", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", ""]
    ];

    // Append Dynamic Ringkasan Rows
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
      { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Total Man Hours value
      { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } }  // PIC block
    ];

    // Metadata merges for ringkasan rows
    phases.forEach((_, idx) => {
      const r = 7 + idx;
      merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
    });

    // 5. POPULATE DYNAMIC ROWS AND CALCULATE LOGICAL CELL SPANS
    phases.forEach((phase) => {
      let phaseTasks: any[] = [];
      if (hierarchicalPhases && hierarchicalPhases.length > 0) {
        const pNode = hierarchicalPhases.find(p => (p.title || p.name) === phase);
        phaseTasks = pNode?.children || [];
      } else {
        phaseTasks = tasksToUse.filter(t => t.phase === phase);
      }
      
      const startRowIndex = data.length;
      
      if (phaseTasks.length > 0) {
        phaseTasks.forEach((task) => {
          const h = parseFloat(taskManHours(task)) || 0;
          const taskTitle = task.title || task.name || "-";

          data.push([
            projectName,
            phase,
            taskTitle,
            task.task_type || task.type || "-",
            (Array.isArray(task.components) ? task.components.join(', ') : task.components) || "-",
            task.detail_task || task.detail || "-",
            h ? `${h} h` : "-",
            h ? `${h * 60} m` : "-",
            formatDate(task.start_time || task.start_date) || "-",
            formatDate(task.end_time || task.end_date) || "-",
            task.status || "TODO",
            "-", // Fachrul Feedback (Always Blank)
            "-"  // Barra Feedback (Always Blank)
          ]);
        });
      } else {
        // CRITICAL: Push a placeholder row if the phase has no tasks (e.g. DEV)
        data.push([
          projectName, phase, "Belum ada task", "-", "-", "-", 
          "0 h", "0 m", "-", "-", "TODO", "-", "-"
        ]);
      }

      const endRowIndex = data.length - 1;

      // Trigger vertical merge spans for Project Name and Phase columns safely
      if (endRowIndex >= startRowIndex) {
        merges.push({ s: { r: startRowIndex, c: 0 }, e: { r: endRowIndex, c: 0 } });
        merges.push({ s: { r: startRowIndex, c: 1 }, e: { r: endRowIndex, c: 1 } });
      }

      // Append Phase Total Row
      const totalRowIndex = data.length;
      data.push([
        projectName,
        phase,
        `TOTAL ${phase} DAYS :`,
        "", "", "", 
        phaseTotalsMap[phase]?.str || "0 Days",
        phaseTotalsMap[phase]?.minsStr || "0 Mins",
        "", "", "", "", ""
      ]);

      // Merge horizontal layout specifically for total strings from Col C to Col F
      merges.push({ s: { r: totalRowIndex, c: 2 }, e: { r: totalRowIndex, c: 5 } });
    });

    // 6. TRANSLATE MATRIX TO COMPILATION WORKSHEET WITH AGGRESSIVE STYLE ENGINE
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = merges;

    // Establish Wide Layout Sizing Matrices
    ws['!cols'] = [
      { wch: 25 }, { wch: 12 }, { wch: 38 }, { wch: 16 }, { wch: 15 }, 
      { wch: 55 }, { wch: 25 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 18 }, { wch: 18 }
    ];

    ws['!rows'] = [];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Deep loop to inject colors, layout alignment and wrap-text rules
    for (let R = range.s.r; R <= range.e.r; ++R) {
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

        if (R === 0) {
          ws[cellRef].s = {
            font: { bold: true, name: "Arial", sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E78" } },
            alignment: { vertical: "center", horizontal: "left" }
          };
          continue;
        }

        if (R === headerRowIndex) {
          ws[cellRef].s = {
            font: { bold: true, name: "Arial", sz: 10, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2F5597" } },
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

        if (R < headerRowIndex) {
          const isLabelCell = (C === 0 || C === 3);
          ws[cellRef].s = {
            font: { bold: isLabelCell, name: "Arial", sz: 10 },
            alignment: { vertical: "center", horizontal: "left" }
          };
          continue;
        }

        const currentCellCValue = String(data[R][2] || '');
        if (currentCellCValue.includes("TOTAL")) {
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
          const shouldWrap = (C === 2 || C === 5 || C === 11 || C === 12);
          ws[cellRef].s = {
            font: { name: "Arial", sz: 10 },
            alignment: { 
              vertical: "center", 
              horizontal: (C === 0 || C === 1 || C >= 6) ? "center" : "left",
              wrapText: shouldWrap
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

    // 7. BUILD FINAL WORKBOOK & POST TO SERVER
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timeline & Breakdown");
    
    // TASK: APPLY STYLES & UPLOAD - Generate Base64
    const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const filename = `OM_DEDY_Timeline_${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;

    const response = await fetch(`${backendUrl}/api/m365/upload-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, excelBase64 })
    });

    // TASK: UI LOADING & BLOCKING STATES - Handle 423 Locked
    if (response.status === 423) {
      alert("Gagal Eksport: File sedang dibuka oleh tim/PIC lain. Silakan tutup tab Excel Online Anda dan coba kembali dalam 1 menit.");
      return null;
    }

    const result = await response.json();
    if (result.success && result.embedUrl) {
      return result.embedUrl;
    } else {
      alert("Gagal memuat Excel dari Microsoft 365: " + (result.error || "Internal Server Error"));
      return null;
    }
  } catch (error) {
    console.error("Integration Error:", error);
    alert("Terjadi kesalahan jaringan ke Backend M365.");
    return null;
  } finally {
    setIsExcelLoading(false);
  }
};

