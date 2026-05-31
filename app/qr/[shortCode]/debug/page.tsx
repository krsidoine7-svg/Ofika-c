// =====================================================
// PAGE DE DEBUG POUR QR CODE
// Accès: /qr/[shortCode]/debug
// =====================================================

import { createClient } from '@/lib/supabase/server'

interface DebugPageProps {
  params: Promise<{
    shortCode: string
  }>
}

export default async function QRDebugPage({ params }: DebugPageProps) {
  const { shortCode } = await params
  const supabase = await createClient()

  const { data: qrRedirect, error } = await supabase
    .from('qr_redirects')
    .select('*')
    .eq('short_code', shortCode)
    .single()

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <title>Debug QR Code: {shortCode}</title>
      </head>
      <body style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4'
      }}>
        <h1 style={{ color: '#4ec9b0' }}>🔍 Debug QR Code</h1>
        
        <div style={{ 
          backgroundColor: '#2d2d2d', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#dcdcaa' }}>Short Code</h2>
          <p style={{ fontSize: '18px', color: '#ce9178' }}>{shortCode}</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#3c1f1f', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f48771'
          }}>
            <h2 style={{ color: '#f48771' }}>❌ Erreur</h2>
            <pre style={{ color: '#f48771' }}>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {qrRedirect && (
          <>
            <div style={{ 
              backgroundColor: '#1f3c1f', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #4ec9b0'
            }}>
              <h2 style={{ color: '#4ec9b0' }}>✅ QR Code trouvé</h2>
            </div>

            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#dcdcaa' }}>Données du QR Code</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>ID:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.id}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Short Code:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.short_code}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>NFC Link:</strong>
                    </td>
                    <td style={{ 
                      padding: '8px', 
                      borderBottom: '1px solid #444',
                      wordBreak: 'break-all',
                      color: '#ce9178'
                    }}>
                      <strong>{qrRedirect.nfc_link}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Titre:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.title || '(aucun)'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Type:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.redirect_type}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Actif:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.is_active ? '✅ Oui' : '❌ Non'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Scans:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {qrRedirect.scan_count}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      <strong style={{ color: '#9cdcfe' }}>Créé le:</strong>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #444' }}>
                      {new Date(qrRedirect.created_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#dcdcaa' }}>Test de Redirection</h2>
              <p style={{ marginBottom: '15px' }}>
                Cliquez sur le bouton pour tester la redirection :
              </p>
              <a 
                href={qrRedirect.nfc_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#4ec9b0',
                  color: '#1e1e1e',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                🚀 Tester la redirection
              </a>
              <a 
                href={`/qr/${shortCode}`}
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#569cd6',
                  color: '#1e1e1e',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}
              >
                🔄 Tester via QR
              </a>
            </div>

            <div style={{ 
              backgroundColor: '#2d2d2d', 
              padding: '20px', 
              borderRadius: '8px'
            }}>
              <h2 style={{ color: '#dcdcaa' }}>JSON Brut</h2>
              <pre style={{ 
                backgroundColor: '#1e1e1e', 
                padding: '15px', 
                borderRadius: '4px',
                overflow: 'auto',
                color: '#ce9178'
              }}>
                {JSON.stringify(qrRedirect, null, 2)}
              </pre>
            </div>
          </>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <a 
            href="/dashboard/qr-codes"
            style={{
              color: '#569cd6',
              textDecoration: 'none'
            }}
          >
            ← Retour au dashboard
          </a>
        </div>
      </body>
    </html>
  )
}
