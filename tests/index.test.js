import axios from "axios";

const API_URL = "http://localhost:3000";  // Eventually will change it 

describe("Authentication",()=>{
    test('Unique user should able to sign up only once ',async ()=>{
        // first time user
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        expect(response.status).toBe(200)
        // Same user should not be able to sign up again

        const updatedResponse = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        expect(updatedResponse.status).toBe(400)
    })

    test('Signup request should fail if username is not provided', async ()=>{
        const username = "random";
        const password  = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                password,
                type:"admin"
            })
        expect(response.status).toBe(400);
    })

    test('Signup request should fail if password is not provided', async ()=>{
        const username = "random";
        const password  = "testpassword";
        const response = await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                type:"admin"
            })
        expect(response.status).toBe(400);
    })

    test('Signin success with correct credentials',async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        const signinResponse = await axios.post(`${API_URL}/api/v1/signin`,
            {
                username,
                password
            })
        expect(signinResponse.status).toBe(200)
        expect(signinResponse.data.token).toBeDefined()
    })

    test('Signin failure with incorrect credentials',async()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
        const signinResponse = await axios.post(`${API_URL}/api/v1/signin`,
            {
                username,
                password:"wrongpassword"
            })
        expect(signinResponse.status).toBe(403);
    })
})

describe("User metadata Endpoint", ()=>{
    let token = "";
    let avatarId = "";
    //Authetication is needed for all tests
    beforeAll(async ()=>{
        const username = "testuser" + Math.floor(Math.random() * 1000);
        const password = "testpassword";
        await axios.post(`${API_URL}/api/v1/signup`,
            {
                username,
                password,
                type:"admin"
            })
           
        const response = await axios.post(`${API_URL}/api/v1/signin`,
            {
                    username,
                    password,
            })
        token = response.data.token;

        const avatarResponse = await axios.post(`${API_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "John"
        })
        
        avatarId = avatarResponse.data.avatarId;
    })

    test("User can't update their metadata with wrong avatar id", async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId:"123232334"
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        expect(response.status).toBe(400)
    })

    test("User can update their metadata with right id",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId: avatarId
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        expect(response.status).toBe(200)
    })

    test("User can't update their metadata because auth header is not present",async()=>{
        const response = await axios.post(`${API_URL}/api/v1/user/`,{
            avatarId: avatarId
        })
        expect(response.status).toBe(403)
    })
})

