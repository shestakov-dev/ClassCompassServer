import { Injectable, Logger } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";

interface SendEmailParams {
	email: string;
	subject: string;
	template: string;
	context: ISendMailOptions["context"];
	attachments?: ISendMailOptions["attachments"];
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	constructor(private readonly mailerService: MailerService) {}

	async sendEmail(params: SendEmailParams): Promise<void> {
		try {
			await this.mailerService.sendMail({
				to: params.email,
				subject: params.subject,
				template: params.template,
				context: params.context,
				attachments: params.attachments,
			});
		} catch (error) {
			this.logger.error(
				`Error while sending mail with the following parameters : ${JSON.stringify(
					params
				)}`,
				error
			);
		}
	}
}
