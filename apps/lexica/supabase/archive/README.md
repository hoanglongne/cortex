# Archived: the Lexica-only class system

`migration_classes.sql` and `migration_classes_v2.sql` built classes for Lexica alone (`lexica_*` tables). They are replaced by the Cortex Classroom core (`packages/classroom/sql/classroom_core.sql`) and the Lexica module (`packages/classroom-lexica/sql/classroom_lexica.sql`). Running the core on a project that ran these files moves their data into the `cortex_*` tables and drops the old ones. Do not run these files again.
