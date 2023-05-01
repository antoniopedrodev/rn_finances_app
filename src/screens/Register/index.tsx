import React, { useState } from "react";
import { 
    Modal, 
    Keyboard,
    Alert 
} from 'react-native';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import uuid from 'react-native-uuid';
import { useNavigation } from "@react-navigation/native"; 
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Control, FieldValues } from "react-hook-form";
import { Button } from "../../components/Forms/Button";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";
import { InputForm } from "../../components/Forms/InputForm";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";
import { CategorySelect } from "../CategorySelect";
import { AppRoutesParamList } from "../../routes/app.routes";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes
} from './style';
import { useAuth } from "../../hooks/auth";

interface FormData {
    name: string;
    amount: string;
}

type RegisterNavigationProps = BottomTabNavigationProp<
  AppRoutesParamList,
  "Cadastrar"
>;

const schema = Yup.object().shape({
    name: Yup.
    string().
    required('Nome é obrigatório'),
    amount: Yup
    .number()
    .typeError('Informe um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('O valor é obrigatório')
});
 
export function Register() {

    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const { user } = useAuth();
    const datakey = `@finances:transactions_user:${user.id}`;
    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const navigation = useNavigation<RegisterNavigationProps>();

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const formControll = control as unknown as Control<FieldValues, any>

    function handleTransactionTypeSelect(type: 'positive' | 'negative') {
        setTransactionType(type);  
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true)
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false)
    }

    async function handleRegister(form: FormData) {
        if(!transactionType)
            return Alert.alert('Selecione o tipo da transação');
        
        if(category.key === 'category')
            return Alert.alert('Selecione a categoria');
        
        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date()
        }

        try {
            const data = await AsyncStorage.getItem(datakey);
            const currentData = data ? JSON.parse(data) : [];
            const dataFormatted = [
                ...currentData,
                newTransaction
            ];

            await AsyncStorage.setItem(datakey, JSON.stringify(dataFormatted));

            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Categoria'
            })

            navigation.navigate('Listagem')

        } catch (error) {
            console.log(error);
            Alert.alert("Não foi possível salvar as informações da transação")
        }
    }

    return (
        <TouchableWithoutFeedback 
            onPress={Keyboard.dismiss}
            containerStyle={{flex: 1}}
            style={{flex: 1}}
        >
            <Container>
                <Header>
                    <Title>
                        Cadastro
                    </Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={formControll} 
                            placeholder="Nome"
                            autoCapitalize='sentences'
                            autoCorrect={false}
                            error={errors.name && errors?.name.message}
                        />

                        <InputForm
                            name="amount"
                            control={formControll}
                            placeholder="Preço"
                            keyboardType="numeric"
                            error={errors.amount && errors?.amount.message}
                        />

                        <TransactionsTypes>

                            <TransactionTypeButton
                                type="up"
                                title="Income"
                                onPress={() => handleTransactionTypeSelect('positive')}
                                isActive={transactionType === 'positive'}
                            />

                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionTypeSelect('negative')}
                                isActive={transactionType === 'negative'}
                            />
                            
                        </TransactionsTypes>
                        
                        <CategorySelectButton 
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>

                    <Button 
                        title="Enviar"
                        onPress={handleSubmit(handleRegister)}
                    />
                </Form>

                <Modal visible={categoryModalOpen}>
                    <CategorySelect 
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>
           
            </Container>
        </TouchableWithoutFeedback>
        
    )
}