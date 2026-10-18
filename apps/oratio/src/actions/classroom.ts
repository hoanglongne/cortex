"use server";

import type { Assignment, ClassInfo } from "@cortex/classroom";
import { ORATIO, type OratioMetrics } from "@cortex/classroom-oratio";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { buildMetrics } from "@/lib/server/classroom";

/**
 * The signed-in student's classes that use Oratio, with their own numbers,
 * which are also sent to those classes (classroom_report). Called when the
 * app opens, after a call, and on the "Lớp học" screen.
 */
export async function syncClasses(): Promise<{ classes: ClassInfo[]; metrics: OratioMetrics | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { classes: [], metrics: null, error: "Not authenticated" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpc = (supabase as any).rpc.bind(supabase);
    const { data, error } = await rpc("classroom_my_classes", { p_app: ORATIO });
    if (error) return { classes: [], metrics: null, error: error.message };
    const classes = ((data ?? []) as ClassInfo[]).filter((c) => c.role === "student");
    if (classes.length === 0) return { classes, metrics: null };

    const assignments: Assignment[] = classes.flatMap((c) => c.assignments.filter((a) => a.app === ORATIO));
    const { metrics, streak } = await buildMetrics(createAdminClient(), user.id, assignments);
    const sent = await rpc("classroom_report", { p_app: ORATIO, p_metrics: metrics, p_streak: streak });
    if (sent.error) console.error("[syncClasses] report", sent.error.message);
    return { classes, metrics };
  } catch (error) {
    console.error("[syncClasses]", error);
    return { classes: [], metrics: null, error: "Không tải được lớp học." };
  }
}
