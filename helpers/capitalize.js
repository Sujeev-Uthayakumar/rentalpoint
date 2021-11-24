function capitalizeFirstLetter(string) {
  var splitString = string.toLowerCase().split(" ");

  for (let i = 0; i < splitString.length; i++) {
    splitString[i] =
      splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
  }

  return splitString.join(" ");
}

module.exports = capitalizeFirstLetter;
