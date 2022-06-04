import inquirer from "inquirer";

export async function confirm(message: string) {
  const { isConfirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isConfirmed',
      message
    }
  ]);

  return isConfirmed;
}