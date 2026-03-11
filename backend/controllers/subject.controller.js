import Subject from '../models/subject.model.js'

export const createSubject = async (req, res) => {
    const {name, code, year, lab} = req.body;

    if(!name || !code) {
        return res.status(400).json({message: "need name and code of the subject"});
    }

    const exists = await Subject.findOne({code});
    if(exists) {
        return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
        name, code, year, lab
    });

    res.status(201).json(subject);
}

export const getAllSubjects = async (req, res) => {
    const subjects = await Subject.find({ isActive: true });
    res.status(200).json(subjects);
}

export const getSubjectById = async (req, res) => {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json(subject);
}

export const updateSubject = async (req, res) => {
        const { id } = req.params;
    const { name, code, year, lab } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // If code is being changed, check uniqueness
    if (code && code !== subject.code) {
      const exists = await Subject.findOne({ code });
      if (exists) {
        return res.status(400).json({ message: "Subject code already exists" });
      }
    }

    subject.name = name ?? subject.name;
    subject.code = code ?? subject.code;
    subject.year = year ?? subject.year;
    subject.lab = lab ?? subject.lab;

    await subject.save();

    res.status(200).json(subject);
}

export const deleteSubject = async (req, res) => {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.isActive = false;
    await subject.save();

    res.status(200).json({
      message: "Subject deleted successfully"
    });
}