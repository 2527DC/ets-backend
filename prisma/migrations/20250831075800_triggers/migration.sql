-- Create trigger function
CREATE OR REPLACE FUNCTION public.audit_department()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(
            table_name, record_id, action, new_data, changed_by
        )
        VALUES (
            'department',
            NEW.id,
            'INSERT',
            to_jsonb(NEW),
            current_setting('app.current_user', true)
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(
            table_name, record_id, action, old_data, new_data, changed_by
        )
        VALUES (
            'department',
            OLD.id,
            'UPDATE',
            to_jsonb(OLD),
            to_jsonb(NEW),
            current_setting('app.current_user', true)
        );
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(
            table_name, record_id, action, old_data, changed_by
        )
        VALUES (
            'department',
            OLD.id,
            'DELETE',
            to_jsonb(OLD),
            current_setting('app.current_user', true)
        );
        RETURN OLD;
    END IF;
END;
$$;

-- Attach trigger to department table
DROP TRIGGER IF EXISTS audit_department_trigger ON department;

CREATE TRIGGER audit_department_trigger
AFTER INSERT OR UPDATE OR DELETE
ON "Department"
FOR EACH ROW
EXECUTE FUNCTION public.audit_department();
