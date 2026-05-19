
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

  // 1. EXTRACT TASKS FROM HIERARCHICAL PHASES OR PROJECT
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

  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  try {
    setIsExcelLoading(true);
    // TASK: PAYLOAD SIMPLIFICATION
    // Send raw project details and tasks array instead of compiling base64 on frontend
    const payload = {
      projectName: project.project_name || project.name || 'Project',
      tasks: tasksToUse.map(t => ({
        ...t,
        // Ensure phase info is explicitly included if it's derived from hierarchy
        phase: t.phase || (hierarchicalPhases?.find(hp => hp.children?.some((child: any) => child.id === t.id))?.title || '')
      }))
    };

    const response = await fetch(`${backendUrl}/api/m365/upload-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // TASK: UI LOADING & BLOCKING STATES - Handle 423 Locked
    if (response.status === 423) {
      alert("Gagal Eksport: File sedang dibuka oleh tim/PIC lain. Silakan tutup tab Excel Online Anda dan coba kembali dalam 1 menit.");
      return null;
    }

    const result = await response.json();
    if (result.success && result.embedUrl) {
      // Return the embedUrl so the component can update its link
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

