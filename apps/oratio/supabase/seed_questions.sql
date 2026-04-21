-- ============================================
-- IELTS Questions Seed Data
-- Run this after running schema.sql
-- ============================================

-- Part 1: Introduction and Interview (4-5 minutes)
-- Familiar topics like home, family, work, studies, hobbies, interests

INSERT INTO public.ielts_questions (part, category, question_text, difficulty) VALUES

-- Home & Accommodation
(1, 'Home & Accommodation', 'Do you live in a house or an apartment?', 'easy'),
(1, 'Home & Accommodation', 'Can you describe the place where you live?', 'easy'),
(1, 'Home & Accommodation', 'What do you like most about living there?', 'medium'),
(1, 'Home & Accommodation', 'What changes would you like to make to your home?', 'medium'),
(1, 'Home & Accommodation', 'Do you plan to live there for a long time?', 'easy'),

-- Hometown
(1, 'Hometown', 'Where are you from?', 'easy'),
(1, 'Hometown', 'What do you like about your hometown?', 'easy'),
(1, 'Hometown', 'Has your hometown changed much since you were a child?', 'medium'),
(1, 'Hometown', 'Would you like to live there in the future?', 'medium'),
(1, 'Hometown', 'What is your hometown famous for?', 'medium'),

-- Work & Studies
(1, 'Work & Studies', 'Do you work or are you a student?', 'easy'),
(1, 'Work & Studies', 'What subject are you studying?', 'easy'),
(1, 'Work & Studies', 'Why did you choose this subject?', 'medium'),
(1, 'Work & Studies', 'What do you find most interesting about your studies?', 'medium'),
(1, 'Work & Studies', 'What do you do for work?', 'easy'),
(1, 'Work & Studies', 'Why did you choose this job?', 'medium'),
(1, 'Work & Studies', 'What do you like most about your job?', 'medium'),

-- Hobbies & Free Time
(1, 'Hobbies & Free Time', 'What do you like to do in your free time?', 'easy'),
(1, 'Hobbies & Free Time', 'Do you have any hobbies?', 'easy'),
(1, 'Hobbies & Free Time', 'How much time do you spend on your hobbies?', 'medium'),
(1, 'Hobbies & Free Time', 'Have your hobbies changed since you were a child?', 'medium'),
(1, 'Hobbies & Free Time', 'Do you prefer spending time alone or with friends?', 'medium'),

-- Music
(1, 'Music', 'Do you like listening to music?', 'easy'),
(1, 'Music', 'What kind of music do you like?', 'easy'),
(1, 'Music', 'Have you ever been to a concert?', 'medium'),
(1, 'Music', 'Do you play any musical instruments?', 'easy'),
(1, 'Music', 'Has your taste in music changed over time?', 'medium'),

-- Technology
(1, 'Technology', 'Do you use computers or smartphones often?', 'easy'),
(1, 'Technology', 'What do you mainly use technology for?', 'medium'),
(1, 'Technology', 'How has technology changed your life?', 'medium'),
(1, 'Technology', 'Do you think people rely too much on technology?', 'hard'),

-- Food & Cooking
(1, 'Food & Cooking', 'What kind of food do you like?', 'easy'),
(1, 'Food & Cooking', 'Do you enjoy cooking?', 'easy'),
(1, 'Food & Cooking', 'What is a typical meal in your country?', 'medium'),
(1, 'Food & Cooking', 'Have your eating habits changed over the years?', 'medium'),
(1, 'Food & Cooking', 'Do you prefer eating at home or in restaurants?', 'medium'),

-- Travel
(1, 'Travel', 'Do you like travelling?', 'easy'),
(1, 'Travel', 'Have you travelled to many places?', 'easy'),
(1, 'Travel', 'What was your most memorable trip?', 'medium'),
(1, 'Travel', 'Do you prefer travelling alone or with others?', 'medium'),
(1, 'Travel', 'Where would you like to travel in the future?', 'medium'),

-- Part 2: Individual Long Turn (3-4 minutes)
-- Candidate speaks for 1-2 minutes on a topic, followed by questions

(2, 'Person', 'Describe a person you admire. You should say: who this person is, how you know them, what qualities they have, and explain why you admire them.', 'medium'),
(2, 'Person', 'Describe a family member you are close to. You should say: who this person is, what they are like, what you do together, and explain why you are close.', 'medium'),
(2, 'Person', 'Describe someone who has had an important influence on your life. You should say: who they are, how you met them, what influence they have had, and explain why this person is important to you.', 'hard'),

(2, 'Place', 'Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like this place.', 'medium'),
(2, 'Place', 'Describe a city you have visited and enjoyed. You should say: where it is, when you went there, what you did there, and explain why you enjoyed it.', 'medium'),
(2, 'Place', 'Describe a building or monument that you find impressive. You should say: what it is, where it is located, what it looks like, and explain why you find it impressive.', 'hard'),

(2, 'Object', 'Describe something you own that is very important to you. You should say: what it is, how long you have had it, why it is important to you, and explain what you would do if you lost it.', 'medium'),
(2, 'Object', 'Describe a book that you have read and enjoyed. You should say: what the book is about, when you read it, why you chose it, and explain why you enjoyed it.', 'medium'),
(2, 'Object', 'Describe a gift you gave to someone. You should say: what the gift was, who you gave it to, why you chose this gift, and explain how they felt about it.', 'medium'),

(2, 'Experience', 'Describe a memorable event from your childhood. You should say: what the event was, when it happened, who was there, and explain why it was memorable.', 'medium'),
(2, 'Experience', 'Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and explain how you felt about it.', 'medium'),
(2, 'Experience', 'Describe a difficult decision you had to make. You should say: what the decision was, when you had to make it, what you decided, and explain why it was difficult.', 'hard'),

(2, 'Activity', 'Describe a hobby or sport you enjoy. You should say: what it is, when you started it, why you enjoy it, and explain how it has changed your life.', 'medium'),
(2, 'Activity', 'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how it would benefit you.', 'medium'),
(2, 'Activity', 'Describe a project you worked on. You should say: what the project was, who you worked with, what you did, and explain what you learned from it.', 'hard'),

-- Part 3: Two-way Discussion (4-5 minutes)
-- Abstract and analytical questions related to Part 2 topic

(3, 'Education', 'How has education changed in your country over the last few decades?', 'hard'),
(3, 'Education', 'What do you think are the most important qualities of a good teacher?', 'medium'),
(3, 'Education', 'Should university education be free for everyone?', 'hard'),
(3, 'Education', 'How will technology change education in the future?', 'hard'),
(3, 'Education', 'Is practical experience more valuable than academic qualifications?', 'hard'),

(3, 'Technology', 'How has technology changed the way people communicate?', 'medium'),
(3, 'Technology', 'What are the advantages and disadvantages of social media?', 'hard'),
(3, 'Technology', 'Will artificial intelligence replace human workers in the future?', 'hard'),
(3, 'Technology', 'How can we ensure that technology benefits everyone in society?', 'hard'),

(3, 'Environment', 'What are the main environmental problems facing your country?', 'medium'),
(3, 'Environment', 'What can individuals do to protect the environment?', 'medium'),
(3, 'Environment', 'Should governments force companies to be more environmentally friendly?', 'hard'),
(3, 'Environment', 'How can we balance economic development with environmental protection?', 'hard'),

(3, 'Society', 'How has family life changed in modern society?', 'hard'),
(3, 'Society', 'What are the advantages and disadvantages of living in a city?', 'medium'),
(3, 'Society', 'How can society better support elderly people?', 'hard'),
(3, 'Society', 'Is work-life balance possible in modern society?', 'hard'),

(3, 'Culture', 'How important is it to preserve traditional culture?', 'hard'),
(3, 'Culture', 'Has globalization had a positive or negative effect on culture?', 'hard'),
(3, 'Culture', 'Should museums and art galleries be free?', 'medium'),
(3, 'Culture', 'How will culture change in the next 50 years?', 'hard'),

(3, 'Health', 'What can governments do to improve public health?', 'hard'),
(3, 'Health', 'Is modern life more or less stressful than in the past?', 'medium'),
(3, 'Health', 'Should healthcare be free for all citizens?', 'hard'),
(3, 'Health', 'How important is mental health compared to physical health?', 'hard'),

(3, 'Work', 'How has the nature of work changed in recent years?', 'medium'),
(3, 'Work', 'What makes a job satisfying?', 'medium'),
(3, 'Work', 'Will remote work become the norm in the future?', 'hard'),
(3, 'Work', 'Is it better to work for a large company or start your own business?', 'hard'),

(3, 'Media', 'How has the internet changed journalism?', 'hard'),
(3, 'Media', 'Do celebrities have too much influence on young people?', 'medium'),
(3, 'Media', 'Should there be stricter control of what appears on the internet?', 'hard'),
(3, 'Media', 'Will traditional newspapers disappear completely?', 'medium');
