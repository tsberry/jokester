var categories = ["Animal", "Cross the Road", "Food", "Kids", "Knock Knock", "Programming", "School", "Walks into a Bar", "Work", "Yo Mama"];

function validateCategory(category) {
    if(categories.includes(category)) return true;
    else return false;
}

module.exports = validateCategory;