require "firebase_token_generator"

def getFirebaseToken

  SECRET = 'BRkmls7IRaXuarIfYVAvWblZs3npbdfb9K53xLpD'
  options = {:admin => True}
  auth_data = {:auth_data => 'foo', :other_auth_data => 'bar'}

  generator = Firebase::FirebaseTokenGenerator.new(SECRET)
  generator.create_token(auth_data, options)

end
