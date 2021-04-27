const db = require('./db/connection');
const express = require('express');
const inquirer = require('inquirer');

const consoleTable = require('console.table');
const chalk = require('chalk');
const PORT = process.env.PORT || 3001;
const app = express();
const menuOptions = [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    // 'View employees by manager - Under Construction',
    // 'View employees by department-Under Construction',
    // 'View the total utilized budget of a department - Under Construction',
    'Add A Department',
    'Add A Role',
    'Add An Employee',
    'Update An Employee Role',
    // 'Update employee managers -Under Construction',
    // 'Delete departments-Under Construction',
    // 'Delete roles -Under Construction',
    // 'Delete employees -Under Construction',
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
        if (options === 'Exit') {
            db.end();
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
const updateEmployee = () => {
    // viewAllEmployees();
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id;`;
    // db.query(sql, (err, result) => {
    //     if (err) throw err;
    //     let employeeArray = [];
    //     console.table(result);
    //     result.forEach((employee) => {
    //         employeeArray.push(`${employee.first_name} ${employee.last_name}`);
    //     });
    // console.log(employeeArray);

    const sqlRoles = `SELECT role.id,role.title FROM role;`;
    db.query(sqlRoles, (err, result) => {
        if (err) throw err;
        let rolesArr = [];
        result.forEach(role => {
            rolesArr.push(role.title);
        });
        // console.log(rolesArr);


        inquirer.prompt([
            {
                type: 'input',
                name: 'employeeId',
                message: 'Please enter the employee ID whose Role needs to be Updated: ',
                validate: empId => {
                    if (empId) {
                        return true;
                    }
                    else {
                        console.log('Please enter a valid Employee ID to continue.')
                        return false;
                    }
                }
            },
            {
                type: 'list',
                name: 'newRole',
                message: 'Please select the updated Role',
                choices: rolesArr
            }
        ]).then(answers => {
            // console.log(answers);
            let newRoleId;
            let emp_updated_id = answers.employeeId;
            let newRole = answers.newRole;
            // let update = [];

            // const { emp_updated_id, newRole } = answers;
            // console.log(employee_updated_id, newRole);
            result.forEach((role) => {
                if (newRole === role.title) {
                    newRoleId = role.id;
                    // update.push(newRoleId);
                }
            });
            // result.forEach((employee) => {
            //     console.log(employee.last_name);
            //     if (answers.employee_updated === `${employee.first_name} ${employee.last_name}`) {
            //         employeeId = employee.id;
            //     }
            // });


            let sqlUpdate = `UPDATE employee SET employee.role_id = ? WHERE employee.id=?;`;

            db.query(sqlUpdate, [newRoleId, emp_updated_id], (err) => {
                if (err) throw err;
                console.log(' ');
                console.log(`Employee Role was Successfully Updated`);
                startApp();
            })

        });
    });
    // });
};