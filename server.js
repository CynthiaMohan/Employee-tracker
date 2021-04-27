const db = require('./db/connection');
const express = require('express');
const inquirer = require('inquirer');

const consoleTable = require('console.table');
const chalk = require('chalk');
// const { response } = require('express');
// const { title } = require('node:process');
// const { response } = require('express');
// const { start } = require('node:repl');
// const { end } = require('./db/connection');
const PORT = process.env.PORT || 3001;
const app = express();
const menuOptions = [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    'Add A Department',
    'Add A Role',
    'Add An Employee',
    'Update An Employee Role',
    'Exit'
];
const startApp = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'Please select an Option: ',
            choices: menuOptions
        }
    ]).then(answers => {
        const { options } = answers;
        console.log(options);
        if (options === 'View All Departments') {
            viewAllDepartments();
        }
        if (options === 'View All Roles') {
            viewAllRoles();
        }
        if (options === 'View All Employees') {
            viewAllEmployees();
        }
        if (options === 'Add A Department') {
            addADepartment();
        }
        if (options === 'Add A Role') {
            addARole();
        }
        if (options === 'Add An Employee') {
            addAnEmployee();
        }
        if (options === 'Update An Employee Role') {
            updateEmployee();
        }
    })
};
startApp();

// View all Departments from department table
const viewAllDepartments = () => {
    let sql = `SELECT department.id AS Id, department.name AS Department FROM department;`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.log(chalk.yellow('DEPARTMENTS'));
        console.log(chalk.yellow('==========='));
        console.table(result);
        startApp();
    });
};
//View All Roles from roles table
const viewAllRoles = () => {
    let sql = `SELECT role.id AS ID,
    role.title AS Title,
    role.salary AS Salary,
    role.department_id AS Department FROM role;`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.log(chalk.green('ROLES'));
        console.log(chalk.green('====='));
        console.table(result);
        startApp();
    });
};
// View all employees from the employee table with details including employee ids,
// first names, last names, job titles, departments, salaries, 
// and managers that the employees report to
const viewAllEmployees = () => {
    const sql = `SELECT x.employee_id, x.first_name, x.last_name, x.title, x.department, x.manager_id, t4.first_name AS manager FROM (
        SELECT t1.id AS employee_id, t1.first_name, t1.last_name, t2.title, t3.name AS department, t2.salary, t1.manager_id 
        FROM
        employee t1
        INNER JOIN
        role t2 
        ON
        t1.role_id = t2.id
        INNER JOIN 
        department t3
        ON
        t2.department_id= t3.id
        ) x
         LEFT OUTER JOIN  employee t4
        ON x.manager_id = t4.id;`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.log(chalk.blueBright('EMPLOYEES'));
        console.log(chalk.blueBright('========='));
        console.table(result);
        startApp();
    });
};

// ************ADD************
//Add A Department
const addADepartment = () => {
    //prompt for new department information
    inquirer.prompt([
        {
            type: 'input',
            name: 'newDepartment',
            message: 'Enter the name of the New Department: '
        }
    ]).then(answer => {
        const { newDepartment } = answer;
        const sql = `INSERT INTO department(name)VALUES(?);`;
        db.query(sql, newDepartment, (err, response) => {
            if (err) throw err;
            console.log(' ');
            console.log(`Department ${newDepartment} was Successfully created`);
            console.log(' ');
            startApp();
        });
    });
};

//Add a new Role
const addARole = () => {
    // const sql = `SELECT * FROM department`;
    // //Save the department names and ids into an array deptArr
    // db.query(sql, (err, res) => {
    //     if (err) throw err;
    //     let deptArr = [];
    //     let { name } = res;
    //     console.log("Response is" + name);
    //     res.forEach(department => {
    //         deptArr.push(department.name);
    //     });
    //     deptArr.push('Create Department');
    // });
    inquirer.prompt([
        {
            type: 'input',
            name: 'newtitle',
            message: 'Enter new Title: '
        },
        {
            type: 'input',
            name: 'newSalary',
            message: 'Enter new Salary:'
        },
        {
            type: 'input',
            name: 'department',
            message: 'Enter Department id: '
        }
    ]).then(answers => {
        console.log(answers);
        const { newtitle, newSalary, department } = answers;
        let sql = `INSERT INTO role (title,salary,department_id)VALUES(?,?,?);`;
        db.query(sql, [newtitle, newSalary, department], (err) => {
            if (err) throw err;
            console.log(' ');
            console.log('The new Role was successfully created');
            viewAllRoles();
        });
    });
};

//Add an Employee to the db with role and MAnager assigned
const addAnEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter first name:',
            validate: addfn => {
                if (addfn) {
                    return true;
                }
                else {
                    console.log('Please enter a valid first name');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter Last name: ',
            validate: addln => {
                if (addln) {
                    return true;
                }
                else {
                    console.log('Please enter a valid Last name');
                    return false;
                }
            }
        }
    ]).then(answers => {
        const details = [answers.first_name, answers.last_name];
        const getRolesSql = `SELECT role.id,role.title FROM role;`;
        db.query(getRolesSql, (err, result) => {
            if (err) throw err;
            console.table(result);
            let roles = result.map(({ id, title }) => ({ name: title, value: id }));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'Select role:',
                    choices: roles
                }
            ]).then(rolesAns => {
                details.push(rolesAns.role);
                const getManagersSql = `SELECT * FROM employee`;
                db.query(getManagersSql, (err, result) => {
                    if (err) throw err;
                    let managers = result.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: 'Choose Manager:',
                            choices: managers
                        }
                    ]).then(managerAns => {
                        details.push(managerAns.manager);
                        const sql = `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?);`;
                        db.query(sql, details, (err) => {
                            if (err) throw err;
                            console.log('Employee Added');
                            viewAllEmployees();
                            startApp();
                        });
                    });
                });
            });
        });
    });
}
