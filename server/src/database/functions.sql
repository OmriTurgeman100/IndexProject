
CREATE OR REPLACE FUNCTION init_service_active_location()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO service_active_location_history (
    service_id,
    active_location,
    started_at
  )
  VALUES (
    NEW.service_id,
    NEW.active_location,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER service_active_location_created
AFTER INSERT ON service_info
FOR EACH ROW
EXECUTE FUNCTION init_service_active_location();


CREATE OR REPLACE FUNCTION track_service_active_location()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.active_location IS DISTINCT FROM NEW.active_location THEN

    UPDATE service_active_location_history
    SET ended_at = NOW()
    WHERE service_id = OLD.service_id
      AND ended_at IS NULL;

    INSERT INTO service_active_location_history (
      service_id,
      active_location,
      started_at
    )
    VALUES (
      NEW.service_id,
      NEW.active_location,
      NOW()
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER service_active_location_changed
AFTER UPDATE OF active_location ON service_info
FOR EACH ROW
EXECUTE FUNCTION track_service_active_location();


CREATE OR REPLACE FUNCTION init_system_active_location()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_active_location_history (
    system_id,
    active_location,
    started_at
  )
  VALUES (
    NEW.system_id,
    NEW.active_location,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER system_active_location_created
AFTER INSERT ON system_info
FOR EACH ROW
EXECUTE FUNCTION init_system_active_location();


CREATE OR REPLACE FUNCTION track_system_active_location()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.active_location IS DISTINCT FROM NEW.active_location THEN

    UPDATE system_active_location_history
    SET ended_at = NOW()
    WHERE system_id = OLD.system_id
      AND ended_at IS NULL;

    INSERT INTO system_active_location_history (
      system_id,
      active_location,
      started_at
    )
    VALUES (
      NEW.system_id,
      NEW.active_location,
      NOW()
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER system_active_location_changed
AFTER UPDATE OF active_location ON system_info
FOR EACH ROW
EXECUTE FUNCTION track_system_active_location();


-- * run once after triggers are applied.

INSERT INTO service_active_location_history (
    service_id,
    active_location,
    started_at
)
SELECT
    service_id,
    active_location,
    NOW()
FROM service_info
WHERE active_location IS NOT NULL
ON CONFLICT DO NOTHING;


INSERT INTO system_active_location_history (
    system_id,
    active_location,
    started_at
)
SELECT
    system_id,
    active_location,
    NOW()
FROM system_info
WHERE active_location IS NOT NULL
ON CONFLICT DO NOTHING;