import json
import random

print("Starting to update frontend employee data...")

# Read the current employee data
with open('employees.json', 'r') as f:
    employees = json.load(f)

print(f"Found {len(employees)} employees")

# Post options including the new Coordinator
posts = [
    'Morning Coordinator',
    'HOD',
    'DHOD',
    'Coordinator'
]

# Update department information and posts
for i, employee in enumerate(employees):
    # Update department to Computer or Electronics
    old_dept = employee.get('department', {}).get('departmentName', 'Unknown')
    new_dept = random.choice(['Computer', 'Electronics'])
    new_dept_id = 1 if new_dept == 'Computer' else 2
    
    employee['departmentId'] = new_dept_id
    employee['department'] = {
        "id": new_dept_id,
        "departmentName": new_dept,
        "departmentManagerId": None,
        "createdAt": "2024-09-18T21:06:39.645Z",
        "updatedAt": "2024-09-18T21:06:39.645Z"
    }
    
    # Update posts with new Coordinator option
    if employee.get('post') is not None:
        employee['post'] = random.choice(posts)
    elif random.random() < 0.1:  # 10% chance to get Coordinator post
        employee['post'] = 'Coordinator'
    
    if i < 5:  # Show first 5 updates
        post_value = employee['post'] if employee['post'] else "No Post"
        print(f"Employee {employee['empId']} ({employee['firstName']} {employee['lastName']}): {old_dept} -> {new_dept}, Post: {post_value}")

# Write the updated data back
with open('employees.json', 'w') as f:
    json.dump(employees, f, indent=2)

print(f"Successfully updated {len(employees)} frontend employees with new department and post data")
