
const { createClient } = require('@supabase/supabase-js');

async function seed() {
    const supabaseUrl = 'https://graqvtzmefiwsafaubcw.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYXF2dHptZWZpd3NhZmF1YmN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk3OTU2MiwiZXhwIjoyMDc0NTU1NTYyfQ.OTX-oxT8E5rq7jR1PT8ND_EZ3lJKUvBQ_gFsZOwlXm8';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.from('system_config').upsert({
        key: 'payment_gateways',
        value: {
            lygos: {
                is_active: true,
                fees: 1.5,
                currency: 'XOF'
            }
        },
        description: 'Configuration des passerelles de paiement'
    }, { onConflict: 'key' });

    if (error) {
        console.error('Error seeding:', error);
    } else {
        console.log('Successfully seeded payment_gateways');
    }
}

seed();
