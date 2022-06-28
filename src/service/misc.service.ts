import contactUsModel from "../model/contactUsDetails";

interface ContactUsDetails {
  email: String;
  name: String;
  subject: String;
  message: String;
}

export const saveContactUsDetails = (details: ContactUsDetails) => {
  return new Promise((resolve, reject) => {
    try {
      const contactUsCreate = new contactUsModel(details);
      const addedContact = Promise.resolve(contactUsCreate.save());
      resolve(addedContact);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};