# ai_moderator-x64

jwt auth done*
sign up - 
role - student or educator

enter basic details 

select role
role based auth
========================================
payload  to include user role 
educator  - create workspace, receive assigments, etc
student - do assignment etc

- endpoints access also considers role


db
--------
- roles - Student, Educator, Admin

 - role permission 
 Student[select workspace, access dashboard, viw]
 Educator[read, write,create,delete]
 Admin[read,write, delete, create]

 etc

models:
- user
- moderation
- assignment
- review
- workspace
- submission

workspace
=======================
workspace is represented by majors availlable - 3(Comp Science, Maths, Arts)
student joins workspace  according to major.
a student can be in several work spaces.

check if student is already in workspace

create workspace - name
add student to workspace - studentid
-------------------------------------
get workspace by id

param - userid
check if roles is student and add to space

assignment
================================
get workspace
create assignment
->  refactor assignment

submission
======================================
submit assignment
update submission
grade submission - eduactor


**create reusable functions for validation checks - isStudent, isEducator, isAuthenticated

chat
============================================
a student can ask ai for help. The ai responds according to moderation rules. - the general rules however 
is to guide and not do.




- chat with ai
- get rules from db to moderate the chats
-flag ai  - take text and do ai detection

moderation
============================
