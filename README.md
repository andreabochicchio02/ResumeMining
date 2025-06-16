# Resume Classification and Matching System

## Project Overview

In today’s competitive job market, recruiters often receive hundreds of resumes for a single position. Manually reviewing each one is time-consuming and prone to subjectivity, which can lead to qualified candidates being overlooked.

This project aims to build a system that automatically classifies resumes into predefined job categories using only their textual content. This helps HR departments streamline the screening process and reduce potential bias.

Additionally, we’ve implemented a resume-job matching feature that ranks candidates based on their similarity to a given job description, further enhancing the recruitment process.

We evaluated several machine learning classifiers and feature extraction methods to identify the most effective approach for resume classification. Our comparative analysis offers insights into building practical, AI-powered tools to support fair and efficient hiring.

---

## Installation

To run this project, you need to install all the required Python packages. All dependencies are listed in the `requirements.txt` file.

The `requirements.txt` file was generated using:

```bash
pip freeze > requirements.txt
````

### Steps to install dependencies

1. **Clone the repository**:

   ```bash
   git clone https://github.com/andreabochicchio02/ResumeMining.git
   cd ResumeMining

2. **(Optional) Create and activate a virtual environment**:
    You can use either a standard Python `venv` or a Conda environment to isolate dependencies and avoid conflicts with other projects.

3. **Install all dependencies**:

   ```bash
   pip install -r requirements.txt

Now you're ready to run the project!

---

## License

This project is licensed under the [MIT License](LICENSE).