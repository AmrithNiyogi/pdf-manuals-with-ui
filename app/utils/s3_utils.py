
import boto3
import uuid
from app.configs.settings import settings
from botocore.exceptions import BotoCoreError

def upload_to_s3(file_content: bytes, filename: str) -> str:
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    unique_name = f"{uuid.uuid4()}_{filename}"
    try:
        s3.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=unique_name,
            Body=file_content,
            ContentType="application/pdf"
        )
        return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_name}"
    except BotoCoreError as e:
        raise RuntimeError(f"S3 upload failed: {str(e)}")
