import json
import random

print("Starting to update frontend employees.json...")

# Read the current employee data
with open('employees.json', 'r') as f:
    employees = json.load(f)

print(f"Found {len(employees)} employees")

# Position options
positions = [
    'Professor',
    'Associate Professor', 
    'Assistant Professor',
    'Lecturer',
    'Senior Instructor',
    'Instructor',
    'Assistant Instructor',
    'Staff'
]

# Add position attribute to each employee
for i, employee in enumerate(employees):
    employee['position'] = random.choice(positions)
    if i < 5:  # Show first 5 updates
        print(f"Employee {employee['empId']} ({employee['firstName']} {employee['lastName']}): {employee['position']}")

# Write the updated data back
with open('employees.json', 'w') as f:
    json.dump(employees, f, indent=2)

print(f"Successfully updated {len(employees)} employees with position attributes")
