import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function exportGoatReportPDF(goats = []) {
  const rows = goats
    .map(
      (g) => `
      <tr>
        <td>${g.tag || g.id}</td>
        <td>${g.name || '-'}</td>
        <td>${g.weight ?? '-'} kg</td>
        <td>${g.temp ?? '-'} °C</td>
        <td>${g.status || '-'}</td>
      </tr>`
    )
    .join('');

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #0F172A;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px;">
          Laporan Monitoring SmartGoat
        </h2>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background: #059669; color: #FFFFFF;">
              <th style="padding: 8px; border: 1px solid #E2E8F0;">ID Tag</th>
              <th style="padding: 8px; border: 1px solid #E2E8F0;">Nama</th>
              <th style="padding: 8px; border: 1px solid #E2E8F0;">Berat</th>
              <th style="padding: 8px; border: 1px solid #E2E8F0;">Suhu</th>
              <th style="padding: 8px; border: 1px solid #E2E8F0;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
  return uri;
}