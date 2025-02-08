import Contact from '../db/Contact.js';
import {
  createContactService,
  updateContactService,
  deleteContactService,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createContact = async (req, res, next) => {
  try {
    const newContact = await createContactService(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updatedContact = await updateContactService(contactId, req.body);
    if (!updatedContact)
      return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deletedContact = await deleteContactService(contactId);
    if (!deletedContact)
      return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({ message: 'Successfully deleted the contact!' });
  } catch (error) {
    next(error);
  }
};

// PUT request - Ödevde bulunmamakta fakat bu istek fonksiyonu oluşturdum ama router/contacts.js de kullanmadım !!!
export const replaceContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const replacedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      { new: true, overwrite: true },
    );

    if (!replacedContact)
      return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({
      status: 200,
      message: 'Successfully replaced the contact!',
      data: replacedContact,
    });
  } catch (error) {
    next(error);
  }
};
