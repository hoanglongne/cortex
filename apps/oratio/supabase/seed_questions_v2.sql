-- ============================================
-- IELTS Questions Seed Data v2 (Expanded)
-- Run this after running schema.sql
-- Replaces the original seed_questions.sql
-- Total: ~300 questions across Part 1, Part 2, Part 3
-- ============================================

-- Clear foreign key references before deleting questions
UPDATE public.matches SET current_question_id = NULL, questions_asked = '{}';
DELETE FROM public.ielts_questions;

-- ============================================
-- PART 1: Introduction and Interview (4-5 minutes)
-- Familiar topics, short answers expected
-- ~120 questions across 20 categories
-- ============================================

INSERT INTO public.ielts_questions (part, category, question_text, difficulty) VALUES

-- Home & Accommodation (6)
(1, 'Home & Accommodation', 'Do you live in a house or an apartment?', 'easy'),
(1, 'Home & Accommodation', 'Can you describe the place where you live?', 'easy'),
(1, 'Home & Accommodation', 'What do you like most about living there?', 'medium'),
(1, 'Home & Accommodation', 'What changes would you like to make to your home?', 'medium'),
(1, 'Home & Accommodation', 'Do you plan to live there for a long time?', 'easy'),
(1, 'Home & Accommodation', 'Is the area where you live good for families?', 'medium'),

-- Hometown (6)
(1, 'Hometown', 'Where are you from?', 'easy'),
(1, 'Hometown', 'What do you like about your hometown?', 'easy'),
(1, 'Hometown', 'Has your hometown changed much since you were a child?', 'medium'),
(1, 'Hometown', 'Would you like to live there in the future?', 'medium'),
(1, 'Hometown', 'What is your hometown famous for?', 'medium'),
(1, 'Hometown', 'What kind of jobs do people do in your hometown?', 'medium'),

-- Work & Studies (8)
(1, 'Work & Studies', 'Do you work or are you a student?', 'easy'),
(1, 'Work & Studies', 'What subject are you studying?', 'easy'),
(1, 'Work & Studies', 'Why did you choose this subject?', 'medium'),
(1, 'Work & Studies', 'What do you find most interesting about your studies?', 'medium'),
(1, 'Work & Studies', 'What do you do for work?', 'easy'),
(1, 'Work & Studies', 'Why did you choose this job?', 'medium'),
(1, 'Work & Studies', 'What do you like most about your job?', 'medium'),
(1, 'Work & Studies', 'Do you prefer to study alone or in a group?', 'medium'),

-- Hobbies & Free Time (6)
(1, 'Hobbies & Free Time', 'What do you like to do in your free time?', 'easy'),
(1, 'Hobbies & Free Time', 'Do you have any hobbies?', 'easy'),
(1, 'Hobbies & Free Time', 'How much time do you spend on your hobbies?', 'medium'),
(1, 'Hobbies & Free Time', 'Have your hobbies changed since you were a child?', 'medium'),
(1, 'Hobbies & Free Time', 'Do you prefer spending time alone or with friends?', 'medium'),
(1, 'Hobbies & Free Time', 'What new hobby would you like to try?', 'medium'),

-- Music (6)
(1, 'Music', 'Do you like listening to music?', 'easy'),
(1, 'Music', 'What kind of music do you like?', 'easy'),
(1, 'Music', 'Have you ever been to a concert?', 'medium'),
(1, 'Music', 'Do you play any musical instruments?', 'easy'),
(1, 'Music', 'Has your taste in music changed over time?', 'medium'),
(1, 'Music', 'Do you think music can affect people''s mood?', 'medium'),

-- Technology (6)
(1, 'Technology', 'Do you use computers or smartphones often?', 'easy'),
(1, 'Technology', 'What do you mainly use technology for?', 'medium'),
(1, 'Technology', 'How has technology changed your life?', 'medium'),
(1, 'Technology', 'Do you think people rely too much on technology?', 'hard'),
(1, 'Technology', 'What was the last app you downloaded?', 'easy'),
(1, 'Technology', 'How do you feel about social media?', 'medium'),

-- Food & Cooking (6)
(1, 'Food & Cooking', 'What kind of food do you like?', 'easy'),
(1, 'Food & Cooking', 'Do you enjoy cooking?', 'easy'),
(1, 'Food & Cooking', 'What is a typical meal in your country?', 'medium'),
(1, 'Food & Cooking', 'Have your eating habits changed over the years?', 'medium'),
(1, 'Food & Cooking', 'Do you prefer eating at home or in restaurants?', 'medium'),
(1, 'Food & Cooking', 'Is there any food you dislike?', 'easy'),

-- Travel (6)
(1, 'Travel', 'Do you like travelling?', 'easy'),
(1, 'Travel', 'Have you travelled to many places?', 'easy'),
(1, 'Travel', 'What was your most memorable trip?', 'medium'),
(1, 'Travel', 'Do you prefer travelling alone or with others?', 'medium'),
(1, 'Travel', 'Where would you like to travel in the future?', 'medium'),
(1, 'Travel', 'Do you prefer to travel by plane or by train?', 'easy'),

-- Weather & Seasons (6)
(1, 'Weather & Seasons', 'What is the weather like in your country?', 'easy'),
(1, 'Weather & Seasons', 'What is your favourite season?', 'easy'),
(1, 'Weather & Seasons', 'Does the weather affect how you feel?', 'medium'),
(1, 'Weather & Seasons', 'What do you usually do on rainy days?', 'easy'),
(1, 'Weather & Seasons', 'Would you prefer to live somewhere with a warm or cold climate?', 'medium'),
(1, 'Weather & Seasons', 'Has the weather in your area changed in recent years?', 'medium'),

-- Shopping (6)
(1, 'Shopping', 'Do you enjoy shopping?', 'easy'),
(1, 'Shopping', 'What do you like to buy?', 'easy'),
(1, 'Shopping', 'Do you prefer shopping online or in stores?', 'medium'),
(1, 'Shopping', 'What was the last thing you bought?', 'easy'),
(1, 'Shopping', 'Do you ever buy things you don''t need?', 'medium'),
(1, 'Shopping', 'Are there many shops near where you live?', 'easy'),

-- Sports & Exercise (6)
(1, 'Sports & Exercise', 'Do you play any sports?', 'easy'),
(1, 'Sports & Exercise', 'What kind of exercise do you do?', 'easy'),
(1, 'Sports & Exercise', 'How often do you exercise?', 'easy'),
(1, 'Sports & Exercise', 'Did you play sports when you were a child?', 'medium'),
(1, 'Sports & Exercise', 'Do you prefer playing sports or watching them?', 'medium'),
(1, 'Sports & Exercise', 'Is sport popular in your country?', 'medium'),

-- Reading (6)
(1, 'Reading', 'Do you enjoy reading?', 'easy'),
(1, 'Reading', 'What kind of books do you like?', 'easy'),
(1, 'Reading', 'Do you prefer reading paper books or e-books?', 'medium'),
(1, 'Reading', 'How often do you read?', 'easy'),
(1, 'Reading', 'Did you read much as a child?', 'medium'),
(1, 'Reading', 'Is there a book that had a big impact on you?', 'medium'),

-- Movies & TV (6)
(1, 'Movies & TV', 'Do you like watching movies?', 'easy'),
(1, 'Movies & TV', 'What kind of movies do you enjoy?', 'easy'),
(1, 'Movies & TV', 'Do you prefer to watch movies at home or at the cinema?', 'medium'),
(1, 'Movies & TV', 'How often do you watch TV?', 'easy'),
(1, 'Movies & TV', 'Who is your favourite actor or actress?', 'easy'),
(1, 'Movies & TV', 'Do you think TV is a good way to learn a language?', 'medium'),

-- Friends & Social Life (6)
(1, 'Friends & Social Life', 'How do you usually spend time with your friends?', 'easy'),
(1, 'Friends & Social Life', 'How often do you see your friends?', 'easy'),
(1, 'Friends & Social Life', 'Do you prefer having a few close friends or many friends?', 'medium'),
(1, 'Friends & Social Life', 'Have you made any new friends recently?', 'medium'),
(1, 'Friends & Social Life', 'Is it easy to make friends in your city?', 'medium'),
(1, 'Friends & Social Life', 'What qualities do you look for in a friend?', 'medium'),

-- Daily Routine (6)
(1, 'Daily Routine', 'What do you usually do in the mornings?', 'easy'),
(1, 'Daily Routine', 'Do you have a fixed daily routine?', 'easy'),
(1, 'Daily Routine', 'What time do you usually go to bed?', 'easy'),
(1, 'Daily Routine', 'Has your daily routine changed recently?', 'medium'),
(1, 'Daily Routine', 'What is your favourite part of the day?', 'medium'),
(1, 'Daily Routine', 'Do you think having a routine is important?', 'medium'),

-- Transport (6)
(1, 'Transport', 'How do you usually get to work or school?', 'easy'),
(1, 'Transport', 'What is the public transport like in your area?', 'medium'),
(1, 'Transport', 'Do you prefer driving or taking public transport?', 'medium'),
(1, 'Transport', 'Have you ever had a long journey?', 'medium'),
(1, 'Transport', 'Would you like to have a car?', 'easy'),
(1, 'Transport', 'How could the transport in your area be improved?', 'medium'),

-- Languages (6)
(1, 'Languages', 'What languages do you speak?', 'easy'),
(1, 'Languages', 'How long have you been learning English?', 'easy'),
(1, 'Languages', 'Do you think it is important to learn other languages?', 'medium'),
(1, 'Languages', 'What do you find most difficult about learning English?', 'medium'),
(1, 'Languages', 'Would you like to learn any other languages?', 'medium'),
(1, 'Languages', 'How do you usually practise English?', 'easy'),

-- Animals & Pets (6)
(1, 'Animals & Pets', 'Do you have any pets?', 'easy'),
(1, 'Animals & Pets', 'What is your favourite animal?', 'easy'),
(1, 'Animals & Pets', 'Did you have any pets when you were a child?', 'easy'),
(1, 'Animals & Pets', 'Are there many animals in your area?', 'medium'),
(1, 'Animals & Pets', 'Do you think it is important to protect wild animals?', 'medium'),
(1, 'Animals & Pets', 'Would you like to have an unusual pet?', 'medium'),

-- Festivals & Celebrations (6)
(1, 'Festivals & Celebrations', 'What is the most important festival in your country?', 'easy'),
(1, 'Festivals & Celebrations', 'How do people celebrate birthdays in your country?', 'easy'),
(1, 'Festivals & Celebrations', 'Do you enjoy going to parties?', 'easy'),
(1, 'Festivals & Celebrations', 'What was the last celebration you attended?', 'medium'),
(1, 'Festivals & Celebrations', 'Do you think traditional celebrations are important?', 'medium'),
(1, 'Festivals & Celebrations', 'How have festivals changed compared to the past?', 'medium'),

-- Nature & Outdoors (6)
(1, 'Nature & Outdoors', 'Do you spend much time outdoors?', 'easy'),
(1, 'Nature & Outdoors', 'What outdoor activities do you enjoy?', 'easy'),
(1, 'Nature & Outdoors', 'Is there much green space near where you live?', 'medium'),
(1, 'Nature & Outdoors', 'Do you prefer the countryside or the city?', 'medium'),
(1, 'Nature & Outdoors', 'When was the last time you visited a park or garden?', 'easy'),
(1, 'Nature & Outdoors', 'Do you think people today spend enough time in nature?', 'medium');


-- ============================================
-- PART 2: Individual Long Turn (3-4 minutes)
-- Candidate speaks for 1-2 minutes on a topic card
-- ~60 questions across 10 categories
-- ============================================

INSERT INTO public.ielts_questions (part, category, question_text, difficulty) VALUES

-- Person (8)
(2, 'Person', 'Describe a person you admire. You should say: who this person is, how you know them, what qualities they have, and explain why you admire them.', 'medium'),
(2, 'Person', 'Describe a family member you are close to. You should say: who this person is, what they are like, what you do together, and explain why you are close.', 'medium'),
(2, 'Person', 'Describe someone who has had an important influence on your life. You should say: who they are, how you met them, what influence they have had, and explain why this person is important to you.', 'hard'),
(2, 'Person', 'Describe a friend you have known for a long time. You should say: who they are, how you met, what you enjoy doing together, and explain why this friendship has lasted.', 'medium'),
(2, 'Person', 'Describe a teacher who has influenced you. You should say: who the teacher was, what subject they taught, what was special about them, and explain how they influenced you.', 'medium'),
(2, 'Person', 'Describe someone you would like to meet. You should say: who this person is, why you want to meet them, what you would say to them, and explain why meeting them would be special.', 'hard'),
(2, 'Person', 'Describe someone who is good at their job. You should say: who this person is, what job they do, how you know them, and explain why they are good at their job.', 'medium'),
(2, 'Person', 'Describe an elderly person you respect. You should say: who this person is, how you know them, what they have done, and explain why you respect them.', 'medium'),

-- Place (8)
(2, 'Place', 'Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like this place.', 'medium'),
(2, 'Place', 'Describe a city you have visited and enjoyed. You should say: where it is, when you went there, what you did there, and explain why you enjoyed it.', 'medium'),
(2, 'Place', 'Describe a building or monument that you find impressive. You should say: what it is, where it is located, what it looks like, and explain why you find it impressive.', 'hard'),
(2, 'Place', 'Describe a quiet place you like to go to. You should say: where this place is, how you found it, how often you go there, and explain why you like it.', 'medium'),
(2, 'Place', 'Describe a place where you feel relaxed. You should say: where it is, what it looks like, what you do there, and explain why you feel relaxed there.', 'medium'),
(2, 'Place', 'Describe a foreign country you would like to visit. You should say: which country it is, what you know about it, what you would do there, and explain why you want to visit it.', 'medium'),
(2, 'Place', 'Describe a place that has been important in your childhood. You should say: where it is, when you used to go there, what you did there, and explain why it was important.', 'medium'),
(2, 'Place', 'Describe a restaurant or café you enjoy. You should say: where it is, what it looks like, what you eat or drink there, and explain why you enjoy going there.', 'easy'),

-- Object (6)
(2, 'Object', 'Describe something you own that is very important to you. You should say: what it is, how long you have had it, why it is important to you, and explain what you would do if you lost it.', 'medium'),
(2, 'Object', 'Describe a book that you have read and enjoyed. You should say: what the book is about, when you read it, why you chose it, and explain why you enjoyed it.', 'medium'),
(2, 'Object', 'Describe a gift you gave to someone. You should say: what the gift was, who you gave it to, why you chose this gift, and explain how they felt about it.', 'medium'),
(2, 'Object', 'Describe a piece of technology you find useful. You should say: what it is, when you got it, how you use it, and explain why you find it useful.', 'medium'),
(2, 'Object', 'Describe a piece of clothing that is special to you. You should say: what it is, when you got it, when you wear it, and explain why it is special.', 'easy'),
(2, 'Object', 'Describe a photo that you remember well. You should say: what is in the photo, when it was taken, who took it, and explain why you remember it.', 'medium'),

-- Experience (8)
(2, 'Experience', 'Describe a memorable event from your childhood. You should say: what the event was, when it happened, who was there, and explain why it was memorable.', 'medium'),
(2, 'Experience', 'Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and explain how you felt about it.', 'medium'),
(2, 'Experience', 'Describe a difficult decision you had to make. You should say: what the decision was, when you had to make it, what you decided, and explain why it was difficult.', 'hard'),
(2, 'Experience', 'Describe a time you learned something new. You should say: what you learned, when you learned it, how you learned it, and explain how it was useful.', 'medium'),
(2, 'Experience', 'Describe a time you were pleasantly surprised. You should say: what happened, when it happened, who was involved, and explain why it was a pleasant surprise.', 'medium'),
(2, 'Experience', 'Describe an achievement you are proud of. You should say: what you achieved, when it happened, how difficult it was, and explain why you are proud.', 'medium'),
(2, 'Experience', 'Describe a mistake you learned from. You should say: what the mistake was, when it happened, what happened after, and explain what you learned.', 'hard'),
(2, 'Experience', 'Describe a time when you felt nervous. You should say: when it was, where you were, what caused the nervousness, and explain how you dealt with it.', 'medium'),

-- Activity (6)
(2, 'Activity', 'Describe a hobby or sport you enjoy. You should say: what it is, when you started it, why you enjoy it, and explain how it has changed your life.', 'medium'),
(2, 'Activity', 'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how it would benefit you.', 'medium'),
(2, 'Activity', 'Describe a project you worked on. You should say: what the project was, who you worked with, what you did, and explain what you learned from it.', 'hard'),
(2, 'Activity', 'Describe something you do to stay healthy. You should say: what it is, how often you do it, when you started, and explain how it helps you.', 'easy'),
(2, 'Activity', 'Describe a creative activity you enjoy. You should say: what it is, how you got into it, how often you do it, and explain why you find it creative.', 'medium'),
(2, 'Activity', 'Describe an outdoor activity you tried for the first time. You should say: what the activity was, where you did it, who you were with, and explain how you felt about it.', 'medium'),

-- Event (6)
(2, 'Event', 'Describe a festival or celebration you attended. You should say: what it was, where and when it took place, who you went with, and explain what you enjoyed about it.', 'medium'),
(2, 'Event', 'Describe a wedding you attended. You should say: whose wedding it was, where it was, what happened, and explain what was special about it.', 'medium'),
(2, 'Event', 'Describe a sporting event you watched. You should say: what it was, where you watched it, who was playing, and explain why you remember it.', 'medium'),
(2, 'Event', 'Describe a concert or live performance you attended. You should say: what it was, where and when it happened, who performed, and explain why you enjoyed it.', 'medium'),
(2, 'Event', 'Describe a family gathering you remember. You should say: when and where it was, who was there, what you did, and explain why you remember it.', 'easy'),
(2, 'Event', 'Describe a school event that was important to you. You should say: what the event was, when it happened, what you did, and explain why it was important.', 'medium'),

-- Media & Entertainment (6)
(2, 'Media & Entertainment', 'Describe a movie that left a strong impression on you. You should say: what the movie was about, when you saw it, who you watched it with, and explain why it impressed you.', 'medium'),
(2, 'Media & Entertainment', 'Describe a song that has a special meaning to you. You should say: what the song is, who performs it, when you first heard it, and explain why it is special.', 'medium'),
(2, 'Media & Entertainment', 'Describe a TV programme you enjoy watching. You should say: what it is about, how you discovered it, how often you watch it, and explain why you enjoy it.', 'easy'),
(2, 'Media & Entertainment', 'Describe a website you often visit. You should say: what the website is, how you found it, what you use it for, and explain why you visit it often.', 'easy'),
(2, 'Media & Entertainment', 'Describe a podcast or radio show you like. You should say: what it is about, how you started listening, how often you listen, and explain what you enjoy about it.', 'medium'),
(2, 'Media & Entertainment', 'Describe an article you read that was interesting. You should say: what it was about, where you read it, why you read it, and explain what you found interesting.', 'medium'),

-- Education & Work (6)
(2, 'Education & Work', 'Describe a subject you enjoyed studying at school. You should say: what the subject was, who taught it, what you learned, and explain why you enjoyed it.', 'easy'),
(2, 'Education & Work', 'Describe a job you would like to have in the future. You should say: what the job is, what qualifications you need, what the job involves, and explain why you want it.', 'medium'),
(2, 'Education & Work', 'Describe a useful lesson you learned outside of school. You should say: what the lesson was, when you learned it, who taught you, and explain how it has helped you.', 'hard'),
(2, 'Education & Work', 'Describe a time you had to work in a team. You should say: what the task was, who was in the team, what your role was, and explain how the teamwork went.', 'medium'),
(2, 'Education & Work', 'Describe a presentation you gave. You should say: what it was about, when and where you gave it, who the audience was, and explain how you felt.', 'medium'),
(2, 'Education & Work', 'Describe a course or training that improved your skills. You should say: what the course was, when you took it, what you learned, and explain how it helped you.', 'medium'),

-- Situation & Problem (6)
(2, 'Situation & Problem', 'Describe a problem you solved recently. You should say: what the problem was, when it happened, how you solved it, and explain how you felt afterwards.', 'medium'),
(2, 'Situation & Problem', 'Describe a time when you had to wait a long time. You should say: when it was, where you were, why you had to wait, and explain how you felt.', 'easy'),
(2, 'Situation & Problem', 'Describe a disagreement you had with someone. You should say: who you disagreed with, what it was about, how it was resolved, and explain what you learned from it.', 'hard'),
(2, 'Situation & Problem', 'Describe a time when you received good advice. You should say: who gave you the advice, what the advice was, when it was given, and explain how it helped you.', 'medium'),
(2, 'Situation & Problem', 'Describe a situation where you had to be polite. You should say: when it happened, who was involved, what you did, and explain why politeness was important.', 'medium'),
(2, 'Situation & Problem', 'Describe a time when you changed your mind about something. You should say: what you changed your mind about, when it happened, what made you change, and explain how you felt about it.', 'hard');


-- ============================================
-- PART 3: Two-way Discussion (4-5 minutes)
-- Abstract and analytical questions
-- ~120 questions across 15 categories
-- ============================================

INSERT INTO public.ielts_questions (part, category, question_text, difficulty) VALUES

-- Education (8)
(3, 'Education', 'How has education changed in your country over the last few decades?', 'hard'),
(3, 'Education', 'What do you think are the most important qualities of a good teacher?', 'medium'),
(3, 'Education', 'Should university education be free for everyone?', 'hard'),
(3, 'Education', 'How will technology change education in the future?', 'hard'),
(3, 'Education', 'Is practical experience more valuable than academic qualifications?', 'hard'),
(3, 'Education', 'What are the advantages and disadvantages of home schooling?', 'hard'),
(3, 'Education', 'Do you think exams are a good way to measure ability?', 'medium'),
(3, 'Education', 'Should schools focus more on life skills or academic subjects?', 'hard'),

-- Technology (8)
(3, 'Technology', 'How has technology changed the way people communicate?', 'medium'),
(3, 'Technology', 'What are the advantages and disadvantages of social media?', 'hard'),
(3, 'Technology', 'Will artificial intelligence replace human workers in the future?', 'hard'),
(3, 'Technology', 'How can we ensure that technology benefits everyone in society?', 'hard'),
(3, 'Technology', 'Should children be limited in how much time they spend on screens?', 'medium'),
(3, 'Technology', 'How has online shopping changed the retail industry?', 'medium'),
(3, 'Technology', 'Do you think technology makes people more or less creative?', 'hard'),
(3, 'Technology', 'What role should governments play in regulating technology companies?', 'hard'),

-- Environment (8)
(3, 'Environment', 'What are the main environmental problems facing your country?', 'medium'),
(3, 'Environment', 'What can individuals do to protect the environment?', 'medium'),
(3, 'Environment', 'Should governments force companies to be more environmentally friendly?', 'hard'),
(3, 'Environment', 'How can we balance economic development with environmental protection?', 'hard'),
(3, 'Environment', 'Do you think climate change can be reversed?', 'hard'),
(3, 'Environment', 'Should developed countries help developing countries with environment issues?', 'hard'),
(3, 'Environment', 'Why do some people not care about the environment?', 'medium'),
(3, 'Environment', 'How can cities become more sustainable?', 'hard'),

-- Society (8)
(3, 'Society', 'How has family life changed in modern society?', 'hard'),
(3, 'Society', 'What are the advantages and disadvantages of living in a city?', 'medium'),
(3, 'Society', 'How can society better support elderly people?', 'hard'),
(3, 'Society', 'Is work-life balance possible in modern society?', 'hard'),
(3, 'Society', 'Do you think the gap between rich and poor is growing?', 'hard'),
(3, 'Society', 'What are the main causes of crime in society?', 'hard'),
(3, 'Society', 'Should everyone do volunteer work?', 'medium'),
(3, 'Society', 'How has the role of women in society changed?', 'hard'),

-- Culture (8)
(3, 'Culture', 'How important is it to preserve traditional culture?', 'hard'),
(3, 'Culture', 'Has globalization had a positive or negative effect on culture?', 'hard'),
(3, 'Culture', 'Should museums and art galleries be free?', 'medium'),
(3, 'Culture', 'How will culture change in the next 50 years?', 'hard'),
(3, 'Culture', 'Why is it important to learn about other cultures?', 'medium'),
(3, 'Culture', 'Do you think younger generations value traditions less?', 'medium'),
(3, 'Culture', 'How does food reflect a country''s culture?', 'medium'),
(3, 'Culture', 'Should governments invest more in the arts?', 'hard'),

-- Health (8)
(3, 'Health', 'What can governments do to improve public health?', 'hard'),
(3, 'Health', 'Is modern life more or less stressful than in the past?', 'medium'),
(3, 'Health', 'Should healthcare be free for all citizens?', 'hard'),
(3, 'Health', 'How important is mental health compared to physical health?', 'hard'),
(3, 'Health', 'Why do many people find it difficult to exercise regularly?', 'medium'),
(3, 'Health', 'Should unhealthy food be taxed more heavily?', 'hard'),
(3, 'Health', 'How has the internet affected people''s mental health?', 'hard'),
(3, 'Health', 'What can schools do to promote healthier lifestyles among students?', 'medium'),

-- Work (8)
(3, 'Work', 'How has the nature of work changed in recent years?', 'medium'),
(3, 'Work', 'What makes a job satisfying?', 'medium'),
(3, 'Work', 'Will remote work become the norm in the future?', 'hard'),
(3, 'Work', 'Is it better to work for a large company or start your own business?', 'hard'),
(3, 'Work', 'Should people be paid the same for similar work regardless of location?', 'hard'),
(3, 'Work', 'How important is job security compared to job satisfaction?', 'medium'),
(3, 'Work', 'Do you think people will work fewer hours in the future?', 'hard'),
(3, 'Work', 'What skills will be most important in the future job market?', 'hard'),

-- Media (8)
(3, 'Media', 'How has the internet changed journalism?', 'hard'),
(3, 'Media', 'Do celebrities have too much influence on young people?', 'medium'),
(3, 'Media', 'Should there be stricter control of what appears on the internet?', 'hard'),
(3, 'Media', 'Will traditional newspapers disappear completely?', 'medium'),
(3, 'Media', 'How can people tell the difference between real and fake news?', 'hard'),
(3, 'Media', 'Should advertising be more regulated?', 'medium'),
(3, 'Media', 'Do you think the media has too much power?', 'hard'),
(3, 'Media', 'How has social media changed the way news is reported?', 'hard'),

-- Travel & Tourism (8)
(3, 'Travel & Tourism', 'What are the benefits of international tourism?', 'medium'),
(3, 'Travel & Tourism', 'Can tourism damage local environments and cultures?', 'hard'),
(3, 'Travel & Tourism', 'How has international travel changed over the last 20 years?', 'medium'),
(3, 'Travel & Tourism', 'Should people reduce air travel to help the environment?', 'hard'),
(3, 'Travel & Tourism', 'What makes a destination attractive to tourists?', 'medium'),
(3, 'Travel & Tourism', 'Is it better to travel independently or with a guided tour?', 'medium'),
(3, 'Travel & Tourism', 'How does tourism benefit local economies?', 'medium'),
(3, 'Travel & Tourism', 'Do you think space tourism will become popular in the future?', 'hard'),

-- Language & Communication (8)
(3, 'Language & Communication', 'Is it important for everyone to learn English?', 'medium'),
(3, 'Language & Communication', 'Should minority languages be protected?', 'hard'),
(3, 'Language & Communication', 'How has technology changed the way we communicate?', 'medium'),
(3, 'Language & Communication', 'Is face-to-face communication better than online communication?', 'medium'),
(3, 'Language & Communication', 'Do you think translation technology will replace language learning?', 'hard'),
(3, 'Language & Communication', 'How does language influence the way people think?', 'hard'),
(3, 'Language & Communication', 'Should schools teach more foreign languages?', 'medium'),
(3, 'Language & Communication', 'Is body language important in communication?', 'medium'),

-- Relationships & Community (8)
(3, 'Relationships & Community', 'How have relationships between neighbours changed?', 'medium'),
(3, 'Relationships & Community', 'Is community spirit declining in modern cities?', 'hard'),
(3, 'Relationships & Community', 'What are the most important values in a friendship?', 'medium'),
(3, 'Relationships & Community', 'How can communities become more inclusive?', 'hard'),
(3, 'Relationships & Community', 'Do you think online friendships are as valuable as real-life ones?', 'hard'),
(3, 'Relationships & Community', 'How important is it for families to eat together?', 'medium'),
(3, 'Relationships & Community', 'Should people be more involved in their local communities?', 'medium'),
(3, 'Relationships & Community', 'Has social media made people more or less connected?', 'hard'),

-- Money & Economy (8)
(3, 'Money & Economy', 'Is money the most important factor in choosing a job?', 'medium'),
(3, 'Money & Economy', 'Should governments provide a basic income for all citizens?', 'hard'),
(3, 'Money & Economy', 'How important is financial education for young people?', 'medium'),
(3, 'Money & Economy', 'Do you think consumerism is a problem in modern society?', 'hard'),
(3, 'Money & Economy', 'Should there be a maximum wage as well as a minimum wage?', 'hard'),
(3, 'Money & Economy', 'How has the sharing economy changed the way we live?', 'hard'),
(3, 'Money & Economy', 'Is it better to save money or spend it?', 'medium'),
(3, 'Money & Economy', 'What effect does advertising have on people''s spending habits?', 'medium'),

-- Youth & Aging (8)
(3, 'Youth & Aging', 'What challenges do young people face today?', 'medium'),
(3, 'Youth & Aging', 'Should the retirement age be raised?', 'hard'),
(3, 'Youth & Aging', 'How can young people and old people learn from each other?', 'medium'),
(3, 'Youth & Aging', 'Do young people today have more opportunities than previous generations?', 'hard'),
(3, 'Youth & Aging', 'How should society prepare for an aging population?', 'hard'),
(3, 'Youth & Aging', 'Are young people today more informed or less informed than in the past?', 'hard'),
(3, 'Youth & Aging', 'Should elderly people continue working if they want to?', 'medium'),
(3, 'Youth & Aging', 'What responsibilities do young people have towards older generations?', 'hard'),

-- Science & Innovation (8)
(3, 'Science & Innovation', 'How important is scientific research for a country''s development?', 'hard'),
(3, 'Science & Innovation', 'Should governments spend more money on space exploration?', 'hard'),
(3, 'Science & Innovation', 'What are the ethical concerns about genetic engineering?', 'hard'),
(3, 'Science & Innovation', 'How can science and technology help solve world problems?', 'hard'),
(3, 'Science & Innovation', 'Do you think people trust science more or less than they used to?', 'medium'),
(3, 'Science & Innovation', 'Should there be limits on scientific research?', 'hard'),
(3, 'Science & Innovation', 'How can we encourage more young people to study science?', 'medium'),
(3, 'Science & Innovation', 'What inventions do you think will be most important in the next 20 years?', 'hard'),

-- Law & Justice (8)
(3, 'Law & Justice', 'What is the purpose of punishment in the justice system?', 'hard'),
(3, 'Law & Justice', 'Should the legal system focus more on rehabilitation than punishment?', 'hard'),
(3, 'Law & Justice', 'Are laws always fair?', 'hard'),
(3, 'Law & Justice', 'How can we reduce crime in society?', 'medium'),
(3, 'Law & Justice', 'Should young offenders be treated differently from adult criminals?', 'hard'),
(3, 'Law & Justice', 'Do you think surveillance cameras help reduce crime?', 'medium'),
(3, 'Law & Justice', 'How important is it in a democracy for people to know their rights?', 'hard'),
(3, 'Law & Justice', 'Should people who commit minor offences be sent to prison?', 'hard');
