import json
import random

print("Starting to update frontend employees.json with post attributes...")

# Read the current employee data
with open('employees.json', 'r') as f:
    employees = json.load(f)

print(f"Found {len(employees)} employees")

# Post options
posts = [
    'Morning Coordinator',
    'HOD',
    'DHOD'
]

# Add post attribute to each employee
for i, employee in enumerate(employees):
    # 70% chance of having no post, 30% chance of having a post
    if random.random() < 0.7:
        employee['post'] = None
    else:
        employee['post'] = random.choice(posts)
    
    if i < 5:  # Show first 5 updates
        post_value = employee['post'] if employee['post'] else "No Post"
        print(f"Employee {employee['empId']} ({employee['firstName']} {employee['lastName']}): {post_value}")

# Write the updated data back
with open('employees.json', 'w') as f:
    json.dump(employees, f, indent=2)

print(f"Successfully updated {len(employees)} employees with post attributes")
