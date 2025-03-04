import Contact from '../db/Contact.js';
import {
  createContactService,
  updateContactService,
  deleteContactService,
} from '../services/contacts.js';
import createError from 'http-errors';
import { uploadImage } from '../services/cloudinary.js';

export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const query = { userId: req.user.id }; // Kullanıcının sadece kendi kontaklarını görmesini sağla

    if (req.query.type) {
      query.contactType = req.query.type;
    }

    if (req.query.isFavourite !== undefined) {
      query.isFavourite = req.query.isFavourite === 'true';
    }

    const totalItems = await Contact.countDocuments(query);
    const totalPages = Math.ceil(totalItems / perPage);
    const contacts = await Contact.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: Number(page),
        perPage: Number(perPage),
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
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
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;
    let photoUrl = '';

    //Eğer resim dosyası varsa cloudinarye yükleme işlemi
    if (req.file) {
      const uploadResponse = await uploadImage(req.file.path);
      photoUrl = uploadResponse.secure_url;
    }

    const newContact = await createContactService({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      photo: photoUrl,
      userId: req.user.id,
    });

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

    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user.id,
    });

    if (!contact) {
      return res
        .status(404)
        .json({ message: 'Contact not found or unauthorized' });
    }

    const updatedContact = await updateContactService(contactId, req.body);

    res.status(200).json({
      status: 200,
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user.id,
    });

    if (!contact) {
      return res
        .status(404)
        .json({ message: 'Contact not found or unauthorized' });
    }

    await deleteContactService(contactId);

    res.status(200).json({ message: 'Successfully deleted the contact!' });
  } catch (error) {
    next(error);
  }
};

export const replaceContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const replacedContact = await Contact.findOneAndReplace(
      { _id: contactId, userId: req.user.id },
      req.body,
      { new: true },
    );

    if (!replacedContact) {
      return res
        .status(404)
        .json({ message: 'Contact not found or unauthorized' });
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully replaced the contact!',
      data: replacedContact,
    });
  } catch (error) {
    next(error);
  }
};
