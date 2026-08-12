-- Create the order_receipts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_receipts', 'order_receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Setup RLS policies for order_receipts
-- Allow public read access to receipts
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'order_receipts' );

-- Allow authenticated users to upload receipts
CREATE POLICY "Auth Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'order_receipts' AND auth.role() = 'authenticated' );

-- Allow users to update/delete their own uploads (optional, but good for retries)
CREATE POLICY "Auth Update Access" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'order_receipts' AND auth.role() = 'authenticated' );
