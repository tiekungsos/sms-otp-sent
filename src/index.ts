import express, { Request, Response } from "express";
import axios from "axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";
const CryptoJS = require("crypto-js");
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// app.post("/encrypt-data", async (req: Request, res: Response) => {

//   console.log(req.body);


//   console.log(encryptData(req.body.data));
  

  
//   res.status(200).json({ status : true});

//   return 
// })

app.post("/check-otp", async (req: Request, res: Response) => {

  let data : any = decryptData(req.body.data);


  console.log('data',data);
  
  const {
    key,
    secret,
    token,
    otp
  } = data

  if (!key || !secret || !token || !otp) {
    res.status(400).json({ error: "Missing required parameters." });
    return;
  }

  try {
    const dataSent: {
      key: string;
      secret: string;
      token: string;
      pin : string
    } = {
      key: key,
      secret: secret,
      token: token,
      pin : otp
    };

    // Encode the credentials in Base64 format
    const credentials = `${process.env.SMS_API_KEY}:${process.env.SMS_API_SECRET}`;
    const encodedCredentials = btoa(credentials);

    // Create the authentication header
    // const authHeader = `Basic ${encodedCredentials}`;

    const encodedData = new URLSearchParams(dataSent).toString();

    const apiData: any = await axios
      .post("https://otp.thaibulksms.com/v2/otp/verify", encodedData, {
        headers: {
          // Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((data: any) => {
        console.log('thaibulksms data',data);
        return data.data
      })
      .catch((err) => {
        console.log("err", err.response.data);
        return {
          code: err.response.data.code,
          statusText: err.response.statusText,
          message: err.response.data.errors[0],
      }
      });


    res.status(200).json(apiData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check OTP." });
  }



})

app.post("/send-otp", async (req: Request, res: Response) => {
  if(!req.body.data) {
    res.status(400).json({ error: "Not found data" });
    return;
  }

  let data : any = decryptData(req.body.data);
  const {
    key,
    secret,
    msisdn
  } = data


  if (!key || !secret || !msisdn) {
    res.status(400).json({ error: "Missing required parameters." });
    return;
  }

  
  const phoneNumber = parsePhoneNumberFromString(msisdn, "TH");

  if (!phoneNumber) {
    res.status(400).json({ error: "Invalid phone number." });
    return;
  }

  try {
    const dataSent: {
      key: string;
      secret: string;
      msisdn: string;
    } = {
      key: key,
      secret: secret,
      msisdn: msisdn
    };

    // Encode the credentials in Base64 format
    const credentials = `${process.env.SMS_API_KEY}:${process.env.SMS_API_SECRET}`;
    const encodedCredentials = btoa(credentials);

    // Create the authentication header
    // const authHeader = `Basic ${encodedCredentials}`;

    const encodedData = new URLSearchParams(dataSent).toString();

    const apiData: any = await axios
      .post("https://otp.thaibulksms.com/v2/otp/request", encodedData, {
        headers: {
          // Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((data: any) => {
        console.log('thaibulksms data',data);
        return data.data
      })
      .catch((err) => {
        console.log("err", err.response.data);
        return {
          code: err.response.data.code,
          statusText: err.response.statusText,
          message: err.response.data.errors[0],
      }
      });


    res.status(200).json(apiData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

app.post("/send-otp-normal", async (req: Request, res: Response) => {
  if(!req.body.data) {
    res.status(400).json({ error: "Not found data" });
    return;
  }

  let data : any = decryptData(req.body.data);
  const {
    tel,
    message
  } = data


  if (!tel || !message) {
    res.status(400).json({ error: "Missing required parameters." });
    return;
  }

  
  const phoneNumber = parsePhoneNumberFromString(tel, "TH");

  if (!phoneNumber) {
    res.status(400).json({ error: "Invalid phone number." });
    return;
  }

  try {
    const dataSent: {
      msisdn: string;
      message: string;
      sender: string;
    } = {
      msisdn: tel,
      message: message,
      sender: "wourchon",
    };

    // Encode the credentials in Base64 format
    const credentials = `${process.env.SMS_API_KEY}:${process.env.SMS_API_SECRET}`;
    const encodedCredentials = btoa(credentials);

    // Create the authentication header
    const authHeader = `Basic ${encodedCredentials}`;

    const encodedData = new URLSearchParams(dataSent).toString();

    const apiData: any = await axios
    .post("https://api-v2.thaibulksms.com/sms", encodedData, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((data: any) => {
        console.log('thaibulksms data',data);
        return data.data
      })
      .catch((err) => {
        console.log("err", err.response.data);
        return {
          code: err.response.data.code,
          statusText: err.response.statusText,
          message: err.response.data.errors[0],
      }
      });


    res.status(200).json(apiData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to encrypt JSON data
function encryptData(data: any): string {
  const jsonString = JSON.stringify(data);

  console.log('process.env.KEY_ENCRYPT',process.env.KEY_ENCRYPT);
  
  const encrypted = CryptoJS.AES.encrypt(jsonString, process.env.KEY_ENCRYPT).toString();
  return encrypted;
}

// Function to decrypt JSON data
function decryptData(encryptedData: string): any {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, process.env.KEY_ENCRYPT);
  const decryptedJsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedJsonString);

}
