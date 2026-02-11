Project Overview

The Automated Timetable Scheduling and Faculty Workload Optimization System is a constraint-driven academic scheduling platform designed to automatically generate conflict-free institutional timetables while optimizing faculty workload distribution. The system enables administrators to manage courses, faculty members, and classroom resources efficiently.

Using a Genetic Algorithm–based optimization approach, the system generates feasible and optimized timetables by satisfying hard institutional constraints while minimizing soft constraint violations related to workload balance and scheduling preferences. This approach ensures both operational correctness and fairness in faculty workload allocation.

Features

1)Role-Based Access Control (RBAC): Separate portals for Admin, Faculty, and Students with restricted privileges.

2)Genetic Algorithm–Based Timetable Generation: Automatically generates optimized and conflict-free academic timetables using an evolutionary optimization approach.

3)Hard & Soft Constraint Handling: Supports mandatory constraints (faculty clash, room clash, capacity limits) and optimizable constraints (workload balance, preferred slots, gap minimization).

4)Faculty Workload Optimization : Ensures fair and balanced distribution of teaching hours across faculty members.

5)Dashboard & Analytics: Visual insights into timetable status, faculty workload, and room utilization.

Genetic Algorithm

The core of this application is the automated scheduling engine powered by a Genetic Algorithm (GA). This heuristic search algorithm mimics the process of natural selection to find an optimal timetable solution.

1)Chromosome Representation
Each chromosome represents a complete timetable
Each gene corresponds to a timetable slot (course, faculty, room, time)

2)Fitness Function
The fitness score determines how "good" a timetable is. It is determined based on the constrain
  1)Hard Constraints: These must be satisfied. Constrain such as No Faculty Overlap,No Room Overlap and room Capacity etc
  2)Soft constraints: Desirable but not mandatory features. Constrain such as Balanced faculty workload, Preferred time slots etc
     
3)Initialization: Create a random population of N timetables.
4)Selection: High-fitness chromosomes are selected using Tournament Selection.
5)Crossover : Exchange of timetable segments between parent chromosomes
6)Mutation : Random slot swaps to introduce diversity and avoid local optima
7)termination: Stops after maximum generations or acceptable fitness is achieved

System Architecture

1)End Users : Administrator , Faculty , Students / Class Representatives

2)Frontend Layer: Web UI and role-specific dashboards , Timetable visualization (day-wise and slot-wise views) , User actions such as generating, viewing, and requesting timetable changes
	
3)Backend Layer : User management and authorization , Constraint handling and validation , Timetable creation, update, and retrieval services , Coordination between frontend, optimization engine, and database

4)Optimization Engine :Timetable Generator,Constraint Evaluation Engine, Hard and Soft Constraint Handler and it Receives academic data and constraints from the backend and apply  Genetic Algorithm to generate optimized timetables and Evaluates solutions using fitness functions and Returns a conflict-free and optimized timetable to the backend

5)Data Layer: Stores the data of Faculty details and availability, Course information , Classroom data and capacities ,Time slots and generated timetables

6)Testing Layer :we are doing 
UI testing for frontend components
API and integration testing for backend services
Validation testing for timetable constraints and GA outputs

7)DevOps Layer:

Containerization using Docker
CI/CD pipelines for automated builds and testing
Deployment environment management
Monitoring and logging

Backend API 

1)Course Assignments & Timetable Management

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | `/api/timetable`                 | Get all course assignments     |
| POST   | `/api/timetable`                 | Create course assignment       |
| GET    | `/api/timetable/find`            | Find assignments by parameters |
| PUT    | `/api/timetable/{id}`            | Update assignment              |
| DELETE | `/api/timetable/{id}`            | Delete assignment              |
| PUT    | `/api/timetable/{id}/slots`      | Update timetable slot          |
| PUT    | `/api/timetable/{id}/slot`       | Update single slot             |
| POST   | `/api/timetable/sample/generate` | Generate sample data           |


2)Generator & Validation APIs

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/generator/validate`    | Validate timetable           |
| GET    | `/api/generator/constraints` | Get constraints              |
| POST   | `/api/generator/generate`    | Generate optimized timetable |

3)Courses Management

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/courses/all`         | Get all courses       |
| POST   | `/api/courses/add`         | Add a new course      |
| PUT    | `/api/courses/update/{id}` | Update course details |
| DELETE | `/api/courses/{id}`        | Delete a course       |

4)Faculty Management

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/api/faculty/all`         | Get all faculty members |
| POST   | `/api/faculty/add`         | Add faculty member      |
| PUT    | `/api/faculty/update/{id}` | Update faculty details  |
| DELETE | `/api/faculty/{id}`        | Delete faculty member   |

5)Classroom Management

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/api/rooms/all`         | Get all classrooms |
| POST   | `/api/rooms/add`         | Add classroom      |
| PUT    | `/api/rooms/update/{id}` | Update classroom   |
| DELETE | `/api/rooms/{id}`        | Delete classroom   |

6)Timetable Constraints Management

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/constraints`         | Get all constraints             |
| POST   | `/api/constraints`         | Create new constraint           |
| GET    | `/api/constraints/default` | Get default constraint template |
| GET    | `/api/constraints/active`  | Get active constraints          |
| GET    | `/api/constraints/{id}`    | Get constraint by ID            |
| PUT    | `/api/constraints/{id}`    | Update constraint               |
| DELETE | `/api/constraints/{id}`    | Delete constraint               |

7)Authentication

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | `/api/auth/login`  | Login using Microsoft OAuth  |
| POST   | `/api/auth/logout` | Logout user                  |
| POST   | `/api/auth/edit`   | Edit timetable (placeholder) |

8)Dashboard

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/dashboard/stats` | Get dashboard statistics |


Testing

Objectives

Ensure correctness of timetable generation and constraint enforcement
Validate backend API behavior and data integrity
Detect defects early through automated testing
Prevent regression during iterative development
Ensure acceptable performance during peak timetable generation

Testing Levels and Tools

1)Unit Testing: Check for  Individual functions (Tool : Jest)

2)Integration Testing : Interactions between APIs, the database, and the optimization engine are validated to ensure
correct data flow. ( Tool : Jest, Supertest)

3)API Testing: All backend APIs are validated using Swagger to verify request/response formats, status codes,
and error handling. (Tool : Swagger (OpenAPI))

4) Frontend Testing : UI components and user interactions are tested using mocked backend responses.(Tool : Jest, frontend component testing framework)

5) End-to-End (E2E) Testing: Complete user workflows such as login, timetable generation, and rescheduling are tested end-to-end.(Tools: Cypress or Playwright)

6)Performance Testing : System performance is evaluated under peak load conditions, particularly during timetable generation.(Tools :  k6 or Artillery).


DevOps

Objectives
• Ensure consistent execution across development, testing, and deployment environments
• Automate build, test, and deployment processes
• Isolate compute-intensive timetable generation workloads
• Maintain responsiveness for user-facing operations
• Enable fast rollback and recovery from failures
• Improve collaboration between development teams

Continuous Integration(Tools : GitHub Actions)
Whenever code is pushed to the repository:
• Source code is automatically checked out
• Docker images are built for all services
• Basic validation and tests are executed
• Build failures prevent deployment

Continuous Deployment
Container-based deployment using versioned Docker images
Successful CI builds generate deployable artifacts
Backend and optimization services deployed independently
Automated health checks ensure service readiness

Rollback 
Immediate rollback to the last stable Docker image on failure
Minimizes downtime during scheduling or constraint evaluation errors

Optimization Workload Handling
Timetable generation involves validating hard constraints and optimizing soft constraints, as shown in the sequence diagram. To handle this efficiently:
• Optimization algorithms execute as background worker services
• Backend APIs remain responsive during schedule generation
• Optimization services can be scaled independently if workload increases

Monitoring & Logging

Monitoring Includes:
Timetable generation execution time
API response latency
Optimization service failures
Resource utilization

Logging Captures:
Timetable generation events
Constraint validation failures
Rescheduling requests and results


Conclusion

The Automated Timetable Management System provides an efficient and scalable solution for academic scheduling using a Genetic Algorithm–based optimization approach. It generates conflict-free timetables while satisfying key constraints such as faculty availability, room capacity, and workload balance.

