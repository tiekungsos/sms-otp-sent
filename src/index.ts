import express, { Request, Response } from "express";
import axios from "axios";
import { parsePhoneNumberFromString } from "libphonenumber-js";
const CryptoJS = require("crypto-js");
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const sender_sms = [
  'Online SMS',
  'E-Marketing',
  'Co-Branding',
  'Bargain',  
  'Live SMS',
  'CPTW',
  'LUNAMKT',
  'MOREISE',
  'PR SMS',
  'Flash sale',
  'Act now',
  'LUCA',
  'Happy Hour',
  'Retail',
  'Target SMS',
  'Direct SMS'
]

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

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

  // console.log(encryptData(req.body.data));
  // return

  if(!req.body.data) {
    res.status(400).json({ error: "Not found data" });
    return;
  }
  try {

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


    if(process.env.OTP_TYPE == 'thaibulk') {
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
        return

    } else if(process.env.OTP_TYPE == 'thsms') {

        const apiData = await senthaisms(tel,message)
      

        res.status(200).json(apiData);
        return
    }
    
 
    res.status(400).json('noe fount sms sent');
    return
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


async function senthaisms(tel : string,message : string, number_sender : number = 0) {


  if(!sender_sms[number_sender]) {
    return {
      code: 0,
      statusText:'false sent sms',
      message: 'not have sender to sent sms',
  }
  }

  const dataSent: {
    msisdn: string[];
    message: string;
    sender: string;
  } = {
    msisdn:[tel],
    message: message,
    sender: sender_sms[number_sender],
  };

  // Encode the credentials in Base64 format
  const credentials = `${process.env.SMS_API_KEY}`;

  // Create the authentication header
  const authHeader = `Bearer ${credentials}`;
  const apiData: any = await axios
  .post("https://thsms.com/api/send-sms",dataSent , {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  })
    .then(async (data: any)  => {
      console.log('thsms data',data.data);

      await delay(2000);

      const checkCreadit = await checkCreditThsms(data.data.data.remaining_credit);

      console.log('checkCreadit',checkCreadit);

      if(checkCreadit.credit == data.data.data.remaining_credit) {
        console.log('success sent sms');
        
        return data.data
      } else {
        await senthaisms(tel,message,number_sender + 1)
      }

    })
    .catch((err) => {
      console.log("err", err.response.data);
      return {
        code: err.response.data.code,
        statusText: err.response.statusText,
        message: err.response.data,
    }
    });

    return apiData
}

async function checkCreditThsms (last_creadit: any) {

  // Encode the credentials in Base64 format
  const credentials = `${process.env.SMS_API_KEY}`;

  // Create the authentication header
  const authHeader = `Bearer ${credentials}`;

  const apiData: any = await axios
  .get("https://thsms.com/api/me" , {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  })
    .then((data: any) => {
      console.log('thsms data',data.data);
      return data.data.data.wallet
    })
    .catch((err) => {
      console.log("err", err.response.data);
      return {
        code: err.response.data.code,
        statusText: err.response.statusText,
        message: err.response.data.errors[0],
    }
    });

    return apiData
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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
