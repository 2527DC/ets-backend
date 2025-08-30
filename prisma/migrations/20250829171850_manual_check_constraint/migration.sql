ALTER TABLE "User"
ADD CONSTRAINT special_need_dates_check
CHECK (
  ("specialNeed" IS NULL AND "specialNeedStart" IS NULL AND "specialNeedEnd" IS NULL)
  OR ("specialNeed" IS NOT NULL AND "specialNeedStart" IS NOT NULL AND "specialNeedEnd" IS NOT NULL)
);
