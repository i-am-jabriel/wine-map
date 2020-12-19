import AWS from 'aws-sdk';

export const aws = {
    id:'AKIAIHVLKFBVSMCAB7GA',
    key:'glCzV1lMFNHyiKuXeATskdayd1KfeAm/m777H4CP',
    bucket: new AWS.S3({
        params: { Bucket: 'corktaint'},
        region: 'us-east-1'
    }),
}
AWS.config.update({
    accessKeyId: aws.id,
    secretAccessKey: aws.key
});

process.env.AWS_ACCESS_KEY=aws.id;
process.env.AWS_SECRET_KEY=aws.key;