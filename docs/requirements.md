## Project Description

This project consists of developing a REST API called FindAFriend for a pet adoption system. The project is built to reinforce SOLID principles and the practice of automated testing.

The API follows a specific set of functionalities and business rules.

## Application Features

**Pet registration:** Ability to add new pets to the system.

**City-based listing:** Listing all pets available for adoption within a specific city.

**Advanced filtering:** Filtering pets based on characteristics (such as age, size, energy level, etc.).

**Pet details:** Viewing comprehensive information about a specific pet.

**ORG registration:** Registering an organization (ORG) responsible for the animals.

**ORG authentication:** Secure login for organizations to manage their data.

## Business Rules
The following conditions must be implemented:

**Mandatory Location:** City information is required to list pets.

**ORG Requirements:** An ORG must provide a physical address and a WhatsApp number.

**Pet Ownership:** Every registered pet must be linked to a specific ORG.

**Direct Contact:** Users interested in adopting a pet will contact the ORG directly via WhatsApp.

**Optional Filters:** All pet characteristic filters are optional, with the exception of the city.

**Administrative Access:** An ORG must be logged in to have administrative access to the application (e.g., to register or edit pets).