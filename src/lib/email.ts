import nodemailer from 'nodemailer'

export interface EmailNotificationData {
  assetSymbol: string
  assetName: string
  currentPrice: number
  combo20: number
  combo50: number
  signalStrength: number
  recommendation: string
  arguments: string
  suggestedAmount?: number
  notificationId: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendEntrySignalNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const {
        assetSymbol,
        assetName,
        currentPrice,
        combo20,
        combo50,
        signalStrength,
        recommendation,
        arguments: args,
        suggestedAmount,
        notificationId,
      } = data

      const emoji = recommendation === 'STRONG_BUY' ? '🚀' : recommendation === 'BUY' ? '📈' : '⏸️'
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f7fafc;
              padding: 30px;
              border: 1px solid #e2e8f0;
              border-top: none;
            }
            .signal-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .strong-buy {
              background: #48bb78;
              color: white;
            }
            .buy {
              background: #4299e1;
              color: white;
            }
            .hold {
              background: #ed8936;
              color: white;
            }
            .metrics {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .metric-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .metric-row:last-child {
              border-bottom: none;
            }
            .metric-label {
              font-weight: 600;
              color: #4a5568;
            }
            .metric-value {
              color: #2d3748;
              font-weight: bold;
            }
            .arguments {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
              white-space: pre-line;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 10px 5px;
              text-align: center;
            }
            .footer {
              text-align: center;
              color: #718096;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${emoji} GTI - Signal d'Opportunité</h1>
            <h2>${assetName} (${assetSymbol})</h2>
          </div>

          <div class="content">
            <div class="signal-badge ${recommendation.toLowerCase().replace('_', '-')}">
              ${recommendation.replace('_', ' ')} - Force: ${signalStrength}/100
            </div>

            <div class="metrics">
              <h3>📊 Indicateurs Clés</h3>
              <div class="metric-row">
                <span class="metric-label">Prix actuel</span>
                <span class="metric-value">${currentPrice.toFixed(2)} €</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">COMBO20 (MA20/BB Basse)</span>
                <span class="metric-value">${combo20.toFixed(4)}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">COMBO50 (MA50/BB Basse)</span>
                <span class="metric-value">${combo50.toFixed(4)}</span>
              </div>
              ${suggestedAmount ? `
              <div class="metric-row">
                <span class="metric-label">💰 Montant suggéré</span>
                <span class="metric-value">${suggestedAmount.toFixed(2)} €</span>
              </div>
              ` : ''}
            </div>

            <div class="arguments">
              <h3>🎯 Analyse</h3>
              ${args}
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${appUrl}/dashboard" class="cta-button">
                📱 Voir sur le Dashboard
              </a>
              <a href="${appUrl}/api/notifications/${notificationId}/execute" class="cta-button" style="background: #48bb78;">
                ✅ Valider l'entrée
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #718096;">
              💡 <strong>Rappel:</strong> Cette notification est générée automatiquement selon vos critères.
              Vérifiez toujours le contexte de marché avant d'investir.
            </p>
          </div>

          <div class="footer">
            <p>GTI - Good Time Investment</p>
            <p>Investissez au bon moment avec le DCA intelligent</p>
          </div>
        </body>
        </html>
      `

      const textContent = `
GTI - Signal d'Opportunité ${emoji}

${assetName} (${assetSymbol})
${recommendation.replace('_', ' ')} - Force du signal: ${signalStrength}/100

INDICATEURS CLÉS:
- Prix actuel: ${currentPrice.toFixed(2)} €
- COMBO20: ${combo20.toFixed(4)}
- COMBO50: ${combo50.toFixed(4)}
${suggestedAmount ? `- Montant suggéré: ${suggestedAmount.toFixed(2)} €` : ''}

ANALYSE:
${args}

Consultez votre dashboard: ${appUrl}/dashboard

---
GTI - Good Time Investment
      `.trim()

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.USER_EMAIL,
        subject: `${emoji} GTI: ${recommendation.replace('_', ' ')} - ${assetSymbol} (Force: ${signalStrength}/100)`,
        text: textContent,
        html: htmlContent,
      })

      console.log(`Email sent for ${assetSymbol} notification ${notificationId}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'GTI - Test Email',
        text: 'This is a test email from GTI (Good Time Investment)',
        html: '<p>This is a test email from <strong>GTI (Good Time Investment)</strong></p>',
      })
      return true
    } catch (error) {
      console.error('Error sending test email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
