-- Create the dating_photo_sharing table
CREATE TABLE IF NOT EXISTS dating_photo_sharing (
    id BIGSERIAL PRIMARY KEY,
    matching_id BIGINT NOT NULL REFERENCES dating_matched(id) ON DELETE CASCADE,
    user1_photo_url TEXT,
    user2_photo_url TEXT,
    user1_uploaded_at TIMESTAMPTZ,
    user2_uploaded_at TIMESTAMPTZ,
    photos_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dating_photo_sharing_matching_id ON dating_photo_sharing(matching_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dating_photo_sharing_updated_at
    BEFORE UPDATE ON dating_photo_sharing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for dating photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('dating-photos', 'dating-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for dating photos
CREATE POLICY "Anyone can view dating photos" ON storage.objects FOR SELECT
USING (bucket_id = 'dating-photos');

CREATE POLICY "Users can upload dating photos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dating-photos');

CREATE POLICY "Users can update their own dating photos" ON storage.objects FOR UPDATE
USING (bucket_id = 'dating-photos');

CREATE POLICY "Users can delete their own dating photos" ON storage.objects FOR DELETE
USING (bucket_id = 'dating-photos');
EOF < /dev/null