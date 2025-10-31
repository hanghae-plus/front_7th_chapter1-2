# Week 2 Assignment

## Objectives

Through this assignment, we want you to experience the following:

1. Getting familiar with the TDD development cycle
2. Learning the basics of AI and Agents and applying them to write code
3. Studying how to instruct AI to write code effectively
4. Once comfortable with AI usage, building your own Agent

These are the four main objectives. Since unfamiliar concepts are presented consecutively, it might be challenging! But don’t give up—if we work together, you’ll have a fascinating first experience. Let’s go!

Additional requirements for recurring schedules have been added.

> **Our server team went on vacation without implementing recurring schedules!  
> Instead, they provide create, update, and delete APIs for the list, so the frontend has to handle the logic. 🤬**

## Assignment Specification

- The goal of this assignment is simple! Please write the features below using the TDD cycle. **However, use AI to assist in writing the code!**
- Add all the following features to the existing app.
  - The provided specification is the minimum functionality. Please plan more concretely and break down the work into smaller tasks!

```markdown
1. Select Recurrence Type
   - When creating or editing a schedule, users can select a recurrence type.
   - Recurrence types are: Daily, Weekly, Monthly, Yearly
     - If the 31st is selected for monthly recurrence → create only on the 31st, not on the last day of months with fewer than 31 days.
     - If February 29th is selected for yearly recurrence → create only on the 29th during leap years!
   - Recurring schedules do not consider overlapping schedules.
2. Display Recurring Schedules
   - In the calendar view, distinguish recurring schedules by adding an icon.
3. Recurrence End
   - Allow specifying an end condition for recurrence.
   - Option: Until a certain date
     - For this example, generate schedules up to 2025-12-31 as the maximum date.
4. **Edit Recurring Schedule**
   1. If the user selects ‘Edit only this occurrence?’ and chooses ‘Yes’, perform a single edit:
      - Editing a recurring schedule converts it into a single schedule.
      - The recurring schedule icon disappears.
   2. If the user selects ‘Edit only this occurrence?’ and chooses ‘No’, perform a full edit:
      - The recurring schedule remains.
      - The recurring schedule icon remains.
5. **Delete Recurring Schedule**
   1. If the user selects ‘Delete only this occurrence?’ and chooses ‘Yes’, perform a single deletion:
      1. Delete only that occurrence.
   2. If the user selects ‘Delete only this occurrence?’ and chooses ‘No’, perform a full deletion:
      1. Delete all occurrences of the recurring schedule.
```

## Basic Assignment (EASY)

**Recommended for those less familiar with writing code using AI.**

The goal of the basic assignment is to write tests and code for the features in the specification using the TDD approach with AI assistance.

1. Before starting the assignment, document the rules for writing good tests that you have learned before. Using AI for this is fine. This knowledge will be used later for AI-assisted test code writing.
2. Write documents that can serve as guidelines for AI tools you use, such as [.cursor/rules](https://docs.cursor.com/en/context/rules) and [copilot-instructions.md](http://copilot-instructions.md), which help AI generate answers.

   If you’re curious about helpful guidelines, sneak a peek at the [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules/tree/main) repository!

3. It’s time to start development feature by feature.  
   Use AI to generate, review, and commit code through the TDD cycle stages: RED → GREEN → REFACTOR.  
   Commit after each stage.

Be careful not to develop all features at once, and leave clear commit messages.

For each stage, verify the code yourself and note in your PR any improvements you made to achieve better results.

## Basic Assignment (HARD)

**Recommended for those somewhat familiar with AI-assisted coding.**

The goal of the advanced assignment is to build the workflow introduced in [2-2. Build Your Own AI Test Agent](https://www.notion.so/2-2-AI-2642dc3ef51480e589a8f1946588336c?pvs=21) and automatically implement the features in the specification.

1. Before starting, document the rules for writing good tests you have learned before. Using AI is fine. This knowledge will be used later for AI-assisted test code writing.
2. Create Agents tailored to the AI tools you use. Build six Agents that operate within the workflow.
3. Start development feature by feature.  
   Use an orchestrator Agent to generate, review, and commit code through the TDD cycle stages: RED → GREEN → REFACTOR.  
   Commit after each stage.

Be careful not to develop all features at once, and leave clear commit messages.

If there are core chat histories from each AI tool, please share them! ([Example](https://github.com/jhlee0409/claude-code-history-viewer/blob/main/README.ko.md))

For each stage, document in your PR the instructions given to the AI Agents to smooth the workflow, verify the code yourself, and note any efforts made to improve results.

## Advanced Assignment

Document your experiences and efforts while working on the assignment!

We have compiled topics worth considering and experiencing through various attempts. Write these carefully and share your feedback with your team.

```jsx
# Report on Stable Feature Development Using AI and Testing

## Why did you choose the tools you used? Have you researched the characteristics of each tool?

## Was there a difference between AI-assisted feature development based on tests and development without it?

## What additional information (context) did you provide to improve AI responses?

## What efforts did you make to help the AI utilize this context well?

## Were you satisfied with the various results generated? What criteria did you use to evaluate the AI’s responses?

## How did you phrase your questions to get better results? Share your various experiences.

## How did you define the scope of tasks assigned to the AI? Try narrowing and widening the scope and describe the results. Also, share what you consider an appropriate unit of work.

## Were there any good references or phrases you wanted to share with your peers? Feel free to brag.

## Have you thought about what AI is good and bad at? Write about your thoughts on this.

## Finally, share your impressions!
```

# 3. Evaluation Criteria

### Common Submissions

- [ ] Documented rules for writing good tests
- [ ] Wrote all tests to implement the specified features and implemented them correctly
- [ ] Implemented all specified features correctly and verified proper operation

### Basic Assignment (Easy)

- [ ] Additional guidelines written to help AI write code well
- [ ] Correctly committed work for each TDD stage
- [ ] Documented efforts to improve AI tool usage in PR

### Basic Assignment (Hard)

- [ ] Agent implementation specification document or code
- [ ] Correctly committed work for each TDD stage
- [ ] History or logs demonstrating proper results
- [ ] Documented efforts to improve AI tool usage in PR

### Advanced Assignment

- [ ] Thoroughly answered all questions

### Others

1. Adherence to TDD process
   - Did you write tests first and confirm they fail before implementing?
   - Did you write minimal code to pass tests for each requirement?
   - Did you perform appropriate refactoring after tests passed?
2. Test quality
   - Does each test clearly verify only one behavior or feature?
   - Do the tests accurately reflect the requirements?
   - Are tests written for all major features and scenarios (both positive and negative cases)?
   - Do the tests include boundary and exception cases?
