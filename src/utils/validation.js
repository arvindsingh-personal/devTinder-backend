const validator = require("validator");

const ALLOWED_GENDERS = ["male", "female", "others"];
const MIN_AGE = 18;
const MAX_AGE = 100;
const MAX_SKILLS = 10;

// Validates age, gender and skills only when they are present in the payload.
const validateProfileFields = ({ age, gender, skills }) => {
    if(age !== undefined) {
        const ageNum = Number(age);
        if(!Number.isInteger(ageNum) || ageNum < MIN_AGE || ageNum > MAX_AGE) {
            throw new Error(`Age must be a whole number between ${MIN_AGE} and ${MAX_AGE}!`);
        }
    }

    if(gender !== undefined && !ALLOWED_GENDERS.includes(gender)) {
        throw new Error(`Gender must be one of: ${ALLOWED_GENDERS.join(", ")}!`);
    }

    if(skills !== undefined) {
        if(!Array.isArray(skills)) {
            throw new Error("Skills must be an array!");
        }
        if(skills.length > MAX_SKILLS) {
            throw new Error(`You can add at most ${MAX_SKILLS} skills!`);
        }
        const isEverySkillValid = skills.every((skill) => typeof skill === "string" && skill.trim().length > 0);
        if(!isEverySkillValid) {
            throw new Error("Each skill must be a non-empty string!");
        }
    }
}

const validateSignup = (req) => {
    const {firstName, lastName, emailId, password, age, gender, skills} = req.body;
    if(!firstName || !lastName) {
        throw new Error("Name is not valid!")
    }
    if(!validator.isEmail(emailId)){
        throw new Error("Email is not valide!");
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong!")
    }
    validateProfileFields({ age, gender, skills });
}

const validateEditData = (req) => {
    const ALLOWED_OPERATIONS = ["firstName", "lastName", "photoUrl", "skills", "about", "gender", "age"];
    const isEditAllowed = Object.keys(req.body).every((key) => ALLOWED_OPERATIONS.includes(key));
    if(!isEditAllowed) {
        return false;
    }
    validateProfileFields(req.body);
    return true;
}

module.exports = {
    validateSignup,
    validateEditData
}