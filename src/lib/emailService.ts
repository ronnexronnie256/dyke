// Email Service Integration
// This can be easily replaced with real email services like SendGrid, Mailgun, or AWS SES

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface BulkEmailData {
  recipients: string[];
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private apiEndpoint = '/api/send-email'; // This would be your serverless function or API endpoint
  private defaultFrom = 'contact@dykeinvestments.com';

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // In development, we'll just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          ...emailData,
          from: emailData.from || this.defaultFrom
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true, message: 'Email sent successfully (development mode)' };
      }

      // In production, integrate with your email service
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          from: emailData.from || this.defaultFrom
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, message: result.message || 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: `Failed to send email: ${error.message}` };
    }
  }

  async sendBulkEmail(bulkEmailData: BulkEmailData): Promise<{ success: boolean; message: string; failedRecipients?: string[] }> {
    try {
      const results = await Promise.allSettled(
        bulkEmailData.recipients.map(recipient =>
          this.sendEmail({
            to: recipient,
            subject: bulkEmailData.subject,
            html: bulkEmailData.html,
            from: bulkEmailData.from
          })
        )
      );

      const failedRecipients: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedRecipients.push(bulkEmailData.recipients[index]);
        }
      });

      const successCount = results.length - failedRecipients.length;
      
      return {
        success: failedRecipients.length === 0,
        message: `${successCount}/${results.length} emails sent successfully`,
        failedRecipients: failedRecipients.length > 0 ? failedRecipients : undefined
      };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      return { success: false, message: `Failed to send bulk email: ${error.message}` };
    }
  }

  // Email templates
  generateBuyerRequestNotification(requestData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🏠 New Buyer Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Dyke Investments</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">👤 Contact Information</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${requestData.contact_name}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${requestData.contact_phone}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${requestData.contact_email || 'Not provided'}</p>
            <p style="margin: 5px 0;"><strong>Preferred Contact:</strong> ${requestData.preferred_contact_method}</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 20px;">🏡 Property Requirements</h2>
            <p style="margin: 5px 0;"><strong>Property Type:</strong> ${requestData.property_type}</p>
            <p style="margin: 5px 0;"><strong>Budget Range:</strong> UGX ${new Intl.NumberFormat().format(requestData.budget_min)} - UGX ${new Intl.NumberFormat().format(requestData.budget_max)}</p>
            <p style="margin: 5px 0;"><strong>Preferred Districts:</strong> ${requestData.preferred_districts.join(', ')}</p>
            ${requestData.preferred_towns ? `<p style="margin: 5px 0;"><strong>Preferred Towns:</strong> ${requestData.preferred_towns}</p>` : ''}
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">⚡ Required Features</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${requestData.requires_water ? '<li>💧 Water connection required</li>' : ''}
              ${requestData.requires_power ? '<li>⚡ Electricity connection required</li>' : ''}
              ${requestData.requires_internet ? '<li>📶 Internet connectivity required</li>' : ''}
              ${requestData.min_bedrooms ? `<li>🛏️ Minimum ${requestData.min_bedrooms} bedrooms</li>` : ''}
              ${requestData.min_bathrooms ? `<li>🚿 Minimum ${requestData.min_bathrooms} bathrooms</li>` : ''}
              ${requestData.min_size_acres ? `<li>📏 Minimum ${requestData.min_size_acres} acres</li>` : ''}
              ${requestData.min_size_sqft ? `<li>📐 Minimum ${requestData.min_size_sqft} sq ft</li>` : ''}
            </ul>
          </div>

          <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #3730a3; margin: 0 0 15px 0; font-size: 20px;">⏰ Timeline & Priority</h2>
            <p style="margin: 5px 0;"><strong>Timeline:</strong> ${requestData.timeline}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> ${requestData.urgency}</p>
          </div>

          ${requestData.additional_requirements ? `
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #6b21a8; margin: 0 0 15px 0; font-size: 20px;">📝 Additional Requirements</h2>
              <p style="margin: 0;">${requestData.additional_requirements}</p>
            </div>
          ` : ''}

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">🚨 Action Required</h2>
            <p style="margin: 0;">Please review this buyer request and start searching for matching properties. Contact the buyer within 24 hours to confirm receipt and discuss next steps.</p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This email was automatically generated from the Dyke Investments buyer request form.<br>
            <strong>Dyke Investments</strong> - Your Trusted Real Estate Partner
          </p>
        </div>
      </div>
    `;
  }

  generatePropertySubmissionNotification(propertyData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🏠 New Property Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Dyke Investments</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">🏡 Property Details</h2>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${propertyData.title}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${propertyData.property_type}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${propertyData.location_district}, ${propertyData.location_town}</p>
            <p style="margin: 5px 0;"><strong>Price:</strong> UGX ${new Intl.NumberFormat().format(propertyData.asking_price)}</p>
          </div>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">👤 Owner Contact</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${propertyData.owner_name}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${propertyData.owner_phone}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${propertyData.owner_email || 'Not provided'}</p>
          </div>

          ${propertyData.description ? `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 20px;">📝 Description</h2>
              <p style="margin: 0;">${propertyData.description}</p>
            </div>
          ` : ''}

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">🚨 Action Required</h2>
            <p style="margin: 0;">Please review this property submission in the admin dashboard and schedule a site visit for verification.</p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This email was automatically generated from the Dyke Investments property submission form.<br>
            <strong>Dyke Investments</strong> - Your Trusted Real Estate Partner
          </p>
        </div>
      </div>
    `;
  }

  generatePropertyMatchEmail(buyerData: any, properties: any[]): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Property Matches Found!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Dyke Investments</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${buyerData.contact_name},</p>
          
          <p style="margin-bottom: 20px;">Great news! We have found <strong>${properties.length}</strong> properties that match your requirements:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">Your Search Criteria:</h3>
            <p style="margin: 5px 0;"><strong>Property Type:</strong> ${buyerData.property_type}</p>
            <p style="margin: 5px 0;"><strong>Budget:</strong> UGX ${new Intl.NumberFormat().format(buyerData.budget_min)} - UGX ${new Intl.NumberFormat().format(buyerData.budget_max)}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${buyerData.preferred_districts.join(', ')}</p>
          </div>

          <h3 style="color: #374151; margin: 20px 0 15px 0;">Matching Properties:</h3>
          
          ${properties.map((property, index) => `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #059669;">
              <h4 style="margin: 0 0 10px 0; color: #059669;">${index + 1}. ${property.title}</h4>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${property.location_district}, ${property.location_town}</p>
              <p style="margin: 5px 0;"><strong>Price:</strong> UGX ${new Intl.NumberFormat().format(property.asking_price)}</p>
              ${property.bedrooms ? `<p style="margin: 5px 0;"><strong>Bedrooms:</strong> ${property.bedrooms}</p>` : ''}
              ${property.bathrooms ? `<p style="margin: 5px 0;"><strong>Bathrooms:</strong> ${property.bathrooms}</p>` : ''}
            </div>
          `).join('')}

          <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3730a3; margin: 0 0 15px 0;">Next Steps:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Our team will contact you within 24 hours to discuss these properties</li>
              <li>We'll schedule site visits for properties you're interested in</li>
              <li>We'll provide detailed information and assist with negotiations</li>
            </ol>
          </div>

          <p style="margin: 20px 0;">If you have any questions or would like to schedule immediate viewings, please contact us:</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 5px 0;"><strong>📞 Phone:</strong> +256 742 371722</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> contact@dykeinvestments.com</p>
            <p style="margin: 5px 0;"><strong>💬 WhatsApp:</strong> +256 742 371722</p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Thank you for choosing Dyke Investments.<br>
            <strong>Your Trusted Real Estate Partner</strong>
          </p>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
