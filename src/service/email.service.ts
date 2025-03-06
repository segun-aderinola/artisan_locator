import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import { config } from "../config";

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.MAIL_SERVICE,
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    });

    this.setupHandlebars()
  }

    private async setupHandlebars() {
      const hbs = (await import("nodemailer-express-handlebars")).default;
  
      this.transporter.use(
        "compile",
        hbs({
          viewEngine: {
            extname: ".hbs",
            layoutsDir: path.resolve(__dirname, "../../src/mailer/views"),
            defaultLayout: undefined,
          },
          viewPath: path.resolve(__dirname, "../../src/mailer/views"),
          extName: ".hbs",
        })
      );
    }
  

  async sendLoginEmail(options: any): Promise<void> {
    const data = {
        name: options.name,
        subject: options.subject,
        time: options.time,
        supportNumber: options.supportNumber,
        supportEmail: options.supportEmail,
    };
    try {
      await this.sendMail(data, options, "login_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending email");
    }
  }

  async requestCreationMail(options: any): Promise<void> {
    const data = {
        name: options.name,
        email: options.email,
        subject: options.subject,
        message: options.message,
    };
    try {
      await this.sendMail(data, options, "request_creation_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending email");
    }
  }

  async acceptedRequestMail(options: any): Promise<void> {
    const data = {
        name: options.name,
        email: options.email,
        subject: options.subject,
        message: options.message,
    };
    try {
      await this.sendMail(data, options, "aceepted_request_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending email");
    }
  }


  async rejectedRequestMail(options: any): Promise<void> {
    const data = {
        name: options.name,
        email: options.email,
        subject: options.subject,
        message: options.message,
    };
    try {
      await this.sendMail(data, options, "rejected_request_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending email");
    }
  }

  async sendOTPNotification(options: any): Promise<void> {
    const data = {
        name: options.name,
        email: options.email,
        subject: options.subject,
        message: options.message,
        otp: options.otp,
    };
    try {
      await this.sendMail(data, options, "otp_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending email");
    }
  }


  async sendUserAccountMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.email,
      password: options.password,
      subject: options.subject,
      link: options.link,
    };
    try {
      await this.sendMail(data, options, "user_account");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async emailVerificationMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      otp: options.otp,
    };
    try {
      await this.sendMail(data, options, "verification_mail");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async passwordResetNotification(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.otp,
      subject: options.subject,
    };
    try {
      await this.sendMail(data, options, "password_reset_notification");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async adminAccountMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.email,
      subject: options.subject,
      password: options.password
    };
    try {
      await this.sendMail(data, options, "admin_account");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }


  async accountVerifiedMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.otp,
      subject: options.subject
    };
    try {
      await this.sendMail(data, options, "account_verified");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async blockAdminAccountMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.otp,
      subject: options.subject,
      reason: options.reason,
    };
    try {
      await this.sendMail(data, options, "block_account_admin");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async blockUserAccountMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.otp,
      subject: options.subject,
      reason: options.reason,
    };
    try {
      await this.sendMail(data, options, "block_account_user");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async sendPasswordChangedMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.email,
      subject: options.subject,
      time: options.time
    };
    try {
      await this.sendMail(data, options, "default-password-changed");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  async sendOTPMail(options: any): Promise<void> {
    const data = {
      name: options.name,
      email: options.email,
      otp: options.otp,
      subject: options.subject,
    };
    try {
      await this.sendMail(data, options, "otp");
    } catch (error: any) {
      console.error({ error: error.message }, "Error sending mail");
    }
  }

  
  private async sendMail(data: any, options: any, template: string): Promise<void> {
    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      template,
      context: data,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error({ error: error.message }, "Failed to send email");
      throw new Error("Failed to send email");
    }
  }
  
}

export default MailService;
