import JSZip from 'jszip'
import crypto from 'crypto'
import { Profile } from "@/lib/types/database"

/**
 * Generates a standard binary Apple Wallet .pkpass archive.
 * Includes pass.json structural definitions, manifest mapping, and developer mock fallback signature.
 */
export async function generateApplePass(profile: Profile): Promise<Buffer> {
  const zip = new JSZip()

  // 1. Apple PassKit JSON structure definitions
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.ofika.digitalcard",
    serialNumber: `ofika-${profile.id}`,
    teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || "OFIKATEAM12",
    webServiceURL: "https://ofika.ci/api/wallet",
    authenticationToken: "vxwxd76x9xqx5x8x",
    barcode: {
      message: `https://ofika.ci/${profile.username || profile.custom_url || profile.id}`,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
      altText: `ofika.ci/${profile.username || profile.custom_url || 'profile'}`
    },
    organizationName: "Ofika",
    description: `Carte de visite de ${profile.name}`,
    logoText: "Ofika",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(15, 15, 15)", // Premium dark background
    labelColor: "rgb(180, 180, 180)",
    generic: {
      primaryFields: [
        {
          key: "name",
          label: "Nom",
          value: profile.name || "Utilisateur Ofika"
        }
      ],
      secondaryFields: [
        {
          key: "job",
          label: "Profession",
          value: profile.job_title || "Membre Ofika"
        },
        {
          key: "company",
          label: "Entreprise",
          value: profile.company || "Ofika"
        }
      ],
      backFields: [
        {
          key: "bio",
          label: "À propos",
          value: profile.bio || "Carte de visite intelligente Ofika."
        },
        {
          key: "link",
          label: "Lien de profil",
          value: `https://ofika.ci/${profile.username || profile.custom_url || profile.id}`
        },
        {
          key: "email",
          label: "E-mail",
          value: profile.email || "Non renseigné"
        },
        {
          key: "phone",
          label: "Téléphone",
          value: profile.phone || "Non renseigné"
        }
      ]
    }
  }

  // 2. Add pass.json to the zip
  zip.file("pass.json", JSON.stringify(passJson, null, 2))

  // 3. Set standard base64 placeholders for required pkpass images (icon/logo)
  const base64Icon = "iVBORw0KGgoAAAANSUhEUgAAADBAAABACAYAAABD7RY6AAAABmJLR0QA/wD/AP+gvaeTAAAAIklEQVR42u3BAQ5AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAADwxQ424AABa/0UlwAAAABJRU5ErkJggg=="
  const base64Logo = "iVBORw0KGgoAAAANSUhEUgAAADBAAABACAYAAABD7RY6AAAABmJLR0QA/wD/AP+gvaeTAAAAIklEQVR42u3BAQ5AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAADwxQ424AABa/0UlwAAAABJRU5ErkJggg=="

  zip.file("icon.png", Buffer.from(base64Icon, 'base64'))
  zip.file("icon@2x.png", Buffer.from(base64Icon, 'base64'))
  zip.file("logo.png", Buffer.from(base64Logo, 'base64'))
  zip.file("logo@2x.png", Buffer.from(base64Logo, 'base64'))

  // 4. Calculate SHA-1 hashes of files to construct manifest.json
  const manifest: Record<string, string> = {}
  const fileList = ["pass.json", "icon.png", "icon@2x.png", "logo.png", "logo@2x.png"]

  for (const file of fileList) {
    const content = await zip.file(file)?.async("nodebuffer")
    if (content) {
      const sha1 = crypto.createHash('sha1').update(content).digest('hex')
      manifest[file] = sha1
    }
  }

  const manifestContent = JSON.stringify(manifest, null, 2)
  zip.file("manifest.json", manifestContent)

  // 5. Encrypt/Sign the manifest or write mock placeholder in Developer mode
  let signatureBuffer = Buffer.from("DEVELOPER_MOCK_SIGNATURE")
  const appleCert = process.env.APPLE_PASS_CERTIFICATE
  const appleKey = process.env.APPLE_PASS_PRIVATE_KEY

  if (appleCert && appleKey) {
    try {
      const sign = crypto.createSign('sha1WithRSAEncryption')
      sign.update(manifestContent)
      signatureBuffer = sign.sign({ key: appleKey, passphrase: process.env.APPLE_PASS_KEY_PASSPHRASE })
    } catch (err) {
      console.error("Apple PKPass signing failed, using fallback:", err)
    }
  }

  zip.file("signature", signatureBuffer)

  // 6. Generate the binary zipped output buffer
  return await zip.generateAsync({ type: "nodebuffer" })
}
