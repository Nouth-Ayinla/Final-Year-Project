export const welcomeEmailTemplate = (name: string) => {
  return `
    <div style="font-family: Arial">
      <h2>Welcome, ${name} 👋</h2>
      <p>Thanks for joining our platform.</p>
    </div>
  `;
};

export const resetPasswordTemplate = (link: string) => {
  return `
    <div>
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${link}">Reset Password</a>
    </div>
  `;
};

export const RegisterOfficerTemplate= (firstName : string , adminId : string, pin : string

 ) =>{
      return `
    <div style="font-family: Arial">
      <h2>Welcome, ${firstName}</h2>
      <h2>Your Id is: ${adminId} </h2>
       <h2>Your pin is: ${pin} </h2>
      <p>Thanks for joining our platform.</p>
    </div>
  `;
}

export const RegisterVoterTemplate= (firstName : string , VoterId : string, pin : string

 ) =>{
      return `
    <div style="font-family: Arial">
      <h2>Welcome, ${firstName}</h2>
      <h2>Your Id is : ${VoterId} </h2>
       <h2>Your Activation pin is : ${pin} </h2>
      <p>Thanks for joining our platform.</p>
    </div>
  `;
}