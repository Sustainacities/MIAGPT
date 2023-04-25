# MIAGPT - Miami and South Florida Data Science Chatbot

MIAGPT, or Mia for short, is a data science chatbot that responds to dialog related to Miami and South Florida ecology and climate. The application uses open data resources from Miami-Dade county, all open data from the cities in the county, and nearby counties of Broward and Palm Beach. Mia generates tables, graphs, and charts from natural language requests for specific data found in the open data sets, and also creates custom SQL queries based on the user's request. 

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Prompts](#prompts)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

## Usage

To use the application, you can run in your browser or from the terminal:

1. Run the application using the command below: (coming soon)
   
2. Once the application is running, you can start a conversation with Mia by typing "Hey Mia" followed by your request. For example, "Hey Mia, show me the temperature trends in Miami for the last year."

## Prompts

The `prompts` folder contains the prompts used by Mia to generate responses. The prompts are organized by category and subcategory. Each prompt file is a JSON file with the following structure:
```
{
    "category": "category_name",
    "subcategory": "subcategory_name",
    "prompts": [
        {
            "prompt": "prompt_text",
            "response": "response_text"
        },
        ...
    ]
}
```

## Examples

The `examples` folder contains a few examples of different interfaces, including chart generation, map generation, and chat-to-XR example. These examples demonstrate the different capabilities of Mia and how they can be integrated into other applications.

## Contributing

If you want to contribute to the development of Mia, please follow these steps:

1. Fork the repository to your own GitHub account
2. Create a new branch for your changes
3. Make your changes and test them thoroughly
4. Submit a pull request to the main repository

## License

The application is licensed under the [MIT License](https://opensource.org/licenses/MIT).
