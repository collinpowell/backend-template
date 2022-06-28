import { create } from "ipfs-http-client";

const projectId = process.env.IPFSPROJECTID;
const projectSecret = process.env.IPFSSECRET;

const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

export default async () => {
    const ipfs = await create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
    return ipfs;
};