import {
	Injectable,
	InternalServerErrorException,
	OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";

@Injectable()
export class MinioService implements OnModuleInit {
	private readonly presignedUrlExpirySeconds: number = 60 * 60;
	private readonly bucket: string;
	private readonly client: Minio.Client;

	constructor(private readonly configService: ConfigService) {
		this.bucket =
			this.configService.getOrThrow<string>("MINIO_BUCKET_NAME");

		this.client = new Minio.Client({
			endPoint: this.configService.getOrThrow<string>("MINIO_ENDPOINT"),
			useSSL:
				this.configService.get<"true" | "false">(
					"MINIO_USE_SSL",
					"false"
				) === "true",
			accessKey:
				this.configService.getOrThrow<string>("MINIO_ACCESS_KEY"),
			secretKey:
				this.configService.getOrThrow<string>("MINIO_SECRET_KEY"),
			region: this.configService.get<string>("MINIO_REGION", "us-east-1"),
		});
	}

	async onModuleInit() {
		await this.ensureBucketExists();
	}

	private async ensureBucketExists() {
		const exists = await this.client.bucketExists(this.bucket);

		if (!exists) {
			await this.client.makeBucket(this.bucket);
		}
	}

	async putObject(
		key: string,
		buffer: Buffer,
		size: number,
		contentType: string
	): Promise<string> {
		try {
			const result = await this.client.putObject(
				this.bucket,
				key,
				buffer,
				size,
				{
					"Content-Type": contentType,
				}
			);

			return result.etag;
		} catch (err) {
			console.error("Failed to upload object to Minio", err);

			throw new InternalServerErrorException("Failed to upload file");
		}
	}

	async getPresignedUrl(key: string): Promise<string> {
		try {
			return await this.client.presignedGetObject(
				this.bucket,
				key,
				this.presignedUrlExpirySeconds
			);
		} catch (err) {
			console.error("Failed to generate presigned URL", err);

			throw new InternalServerErrorException(
				"Failed to generate file URL"
			);
		}
	}

	async removeObject(key: string): Promise<void> {
		try {
			await this.client.removeObject(this.bucket, key);
		} catch (err) {
			console.error("Failed to remove object", err);

			throw new InternalServerErrorException("Failed to delete file");
		}
	}
}
