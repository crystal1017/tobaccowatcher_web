'''
Create new users and prepare emails to send to the users.

To run this script:
export DJANGO_SETTINGS_MODULE=tobaccowatcher.settings
export PYTHONPATH=/home/twatcher/webapps/tobaccowatcher/tobacco_watcher/src/
Use python2.7

This script can either create new accounts or activate existing accounts.
'''
class AddUsers:
	def load_users(self, filename):
		import codecs
		users = []
		emails = []
		with codecs.open(filename, 'r', 'utf-8') as input:
			for ii, line in enumerate(input):
				line = line.strip()
				print line
				split_line = line.split('\t')
				if len(split_line) == 4:
					first, last, email, affiliation = split_line
					users.append((first, last, email, affiliation))
				else:
					email = split_line[0]
					emails.append(email)

		return users, emails
			
	def process_users(self, users, emails):

		from tobaccowatcher.models import UserManager
		from tobaccowatcher.models import User

		user_manager = UserManager()

		added_users = []
		for first, last, email, affiliation in users:
			# Does this user already exist?
			results = User.objects.filter(email=email)
			if results:
				print 'Found user: ', email
				continue

			# Create a password for this user.
			import string, random
			password_length = 10
			password = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(password_length))
			
			#user = user_manager.create_user(email, password=password)

			user = User.objects.create_user(email=email, password=password)

			user.last_name = last
			user.first_name = first
			user.email = email
			user.affiliation = affiliation
			user.save()
			
			
			print 'Added %s with password "%s"' % (email, password)
			added_users.append((first, last, email, password))

		for email in emails:
			# Does this user already exist?                                                                                                                    
                        results = User.objects.filter(email=email)
			if not results:
				print 'Error: missing user for %s' % email
				continue
			user = results[0]
			if user.is_active:
				print 'User %s is already active.' % email
				continue

			# Create a password for this user.
			import string, random
                        password_length = 10
                        password = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(password_length))
			user.set_password(password)
			user.is_active = True
                        user.save()

                        print 'Activated %s with password "%s"' % (email, password)
                        added_users.append((user.first_name, user.last_name, user.email, password))
			
		return added_users
	
	def send_emails(self, users, message, subject, from_address):
		from django.core.mail import EmailMessage

		if message != None:
			for user in users:
				first, last, email, password = user
				new_message = message.replace('%FIRST%', first).replace('%LAST%', last).replace('%EMAIL%', email).replace('%PASSWORD%', password)
		
				email_obj = EmailMessage(subject=subject, body=new_message, from_email=from_address, to=[email], cc=[from_address])
			
				email_obj.send(fail_silently=False)
			print 'Send %d messages.' % len(users)
		
	def main(self):
		import sys, argparse
		parser = argparse.ArgumentParser(description='Add new users and prepare emails to send to the users.')
		parser.add_argument('--email_message', required=False, help='Send this email to the new users. Include variables for %%PASSWORD%% %%EMAIL%% %%FIRST%% %%LAST%%')
		parser.add_argument('--user_file', required=True, help='A tab separated file containing users first name, last name, email address and affiliation')


		args = parser.parse_args()
		user_file = args.user_file
		email_message_file = args.email_message


		users, emails = self.load_users(user_file)
		print 'Loaded %d new users and %d existing users.' % (len(users), len(emails))
		
		added_users = self.process_users(users, emails)
		
		import codecs
		email_message = None
		if email_message_file != None:
			with codecs.open(email_message_file, 'r', 'utf-8') as input:
				email_message = ''.join(input.readlines())
		
		subject = 'Welcome to TobaccoWatcher'
		from_address = 'Contact <contact@tobaccowatcher.org>'
		self.send_emails(added_users, email_message, subject, from_address)

		print 'Done.'

if __name__ == '__main__':
	AddUsers().main()
