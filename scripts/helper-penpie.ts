import fs from 'fs';

import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { DuneClient } from "@duneanalytics/client-sdk";

export interface reward {
  pool: string;
  wTime: number;
  rewardForAccount: string;
  rewardInPool: string;
  totalVotingPower: string;
}


export async function uploadToS3(bucket: string, path: string, data: object): Promise<void> {
  const s3 = new S3({ region: 'us-west-1' });

  const params = {
    Bucket: bucket,
    Key: path,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  };

  try {
    const result = await s3.send(new PutObjectCommand(params));
    console.log('Data successfully uploaded:', result);
  } catch (error) {
    console.error('Error uploading data:', error);
  }
}

export async function uploadCSVToDune(tableName: string, data: any): Promise<boolean> {
  const client = new DuneClient("Grfps0JUHzUMDzOI5DcIGgFr6MD5aA0H");
  const result = await client.table.uploadCsv({
    table_name: tableName,
    description: "",
    data,
    is_private: true,
  });

  return result;
}

export function arrayToCSV(data: reward[], filePath: string): void {
  // Create the header row
  const headers = "pool,wTime,rewardForAccount,rewardInPool,totalVotingPower";

  // Map each object to a CSV string
  const rows = data.map(item => `${item.pool},${item.wTime},${item.rewardForAccount},${item.rewardInPool},${item.totalVotingPower}`);

  // Join all rows into a single CSV string with newline characters
  fs.writeFileSync(filePath, [headers, ...rows].join('\n'), 'utf-8');

  console.log(`CSV exported to ${filePath}`);
};

export function writeJson(object: object, filePath: string): void {
  const jsonString = JSON.stringify(object, null, 2);

  fs.writeFileSync(filePath, jsonString, 'utf-8');

  console.log(`JSON exported to ${filePath}`);
}

// Convert array to CSV string directly
export function arrayToCSVString(data: reward[]): string {
  // Create the header row
  const headers = "pool,wTime,rewardForAccount,rewardInPool,totalVotingPower";

  // Map each object to a CSV string
  const rows = data.map(item =>
    `${item.pool},${item.wTime},${item.rewardForAccount},${item.rewardInPool},${item.totalVotingPower}`
  );

  // Join all rows into a single CSV string with newline characters
  return [headers, ...rows].join('\n');
};

// Convert array to CSV Buffer directly
export function arrayToCSVBuffer(data: reward[]): Buffer {
  const csvString = arrayToCSVString(data);
  return Buffer.from(csvString, 'utf-8');
};

export function formatDateToUTC(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  // const hours = String(date.getUTCHours()).padStart(2, '0');
  // const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  // const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}