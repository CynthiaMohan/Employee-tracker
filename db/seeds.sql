INSERT INTO department (name) 
VALUES 
('Aviation'),
('Mechanical Engineering'),
('Computer Science'),
('IT'),
('Civil Engineering');

INSERT INTO role(title, salary,department_id) 
VALUES
('Sr.Manager', '250000',2),
('Manger', '200000',2),
('developer', '130000',4),
('jr.developer', '90000',4);

INSERT INTO employee(first_name,last_name,role_id,manager_id)
VALUES
('Ronald', 'Firbank', 3, 1),
('Virginia', 'Woolf', 4, 1),
('Piers', 'Gaveston', 3, 0),
('Charles', 'LeRoi', 2, 1),
('Katherine', 'Mansfield', 2, 1),
('Dora', 'Carrington', 3, 0),
('Edward', 'Bellamy', 3, 0),
('Montague', 'Summers', 3, 1),
('Octavia', 'Butler', 3, 1),
('Unica', 'Zurn', 1,NULL);
